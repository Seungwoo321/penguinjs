/**
 * EventLoopEngine - JavaScript 이벤트 루프의 도메인 모델
 * 
 * 이 클래스는 JavaScript 이벤트 루프의 동작을 시뮬레이션하는 핵심 도메인 로직을 포함합니다.
 * React나 다른 UI 프레임워크에 의존하지 않으며, 순수한 TypeScript로 구현되었습니다.
 */

import {
  EventLoopState,
  EventLoopConfig,
  ExecutionResult,
  ExecutionPolicy,
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem,
  Task,
  SideEffect,
  TaskStatus
} from './types';

export class EventLoopEngine {
  private state: EventLoopState;
  private config: EventLoopConfig;
  private policy: ExecutionPolicy;
  private executionHistory: ExecutionResult[] = [];
  private tickCallbacks: Array<(state: EventLoopState) => void> = [];

  constructor(
    config: EventLoopConfig,
    policy?: ExecutionPolicy
  ) {
    this.config = config;
    this.state = this.createInitialState();
    this.policy = policy || this.createDefaultPolicy();
  }

  // 초기 상태 생성
  private createInitialState(): EventLoopState {
    return {
      phase: 'idle',
      isRunning: false,
      currentTick: 0,
      callStack: [],
      microtaskQueue: [],
      macrotaskQueue: []
    };
  }

  // 기본 실행 정책
  private createDefaultPolicy(): ExecutionPolicy {
    return {
      shouldProcessMicrotasks: () => this.state.callStack.length === 0,
      shouldProcessMacrotask: () => 
        this.state.callStack.length === 0 && 
        this.state.microtaskQueue.length === 0,
      getNextMacrotask: () => this.state.macrotaskQueue[0],
      handleStackOverflow: () => {
        throw new Error('Maximum call stack size exceeded');
      },
      handleTimeout: () => {
        throw new Error('Execution timeout');
      }
    };
  }

  // 현재 상태 조회
  getState(): Readonly<EventLoopState> {
    return { ...this.state };
  }

  // 실행 이력 조회
  getExecutionHistory(): ReadonlyArray<ExecutionResult> {
    return [...this.executionHistory];
  }

  // 콜스택에 함수 추가
  pushToCallStack(frame: Omit<CallStackFrame, 'id' | 'createdAt' | 'status'>): ExecutionResult {
    if (this.state.callStack.length >= this.config.maxCallStackSize) {
      this.policy.handleStackOverflow();
      return this.createErrorResult(new Error('Stack overflow'));
    }

    const newFrame: CallStackFrame = {
      ...frame,
      id: this.generateTaskId(),
      createdAt: Date.now(),
      status: 'pending',
      type: 'callstack'
    };

    this.state.callStack.push(newFrame);
    
    const result: ExecutionResult = {
      success: true,
      stateChange: { callStack: [...this.state.callStack] },
      sideEffects: []
    };

    this.recordExecution(result);
    return result;
  }

  // 콜스택에서 함수 제거
  popFromCallStack(): ExecutionResult {
    const frame = this.state.callStack.pop();
    
    if (!frame) {
      return this.createErrorResult(new Error('Call stack is empty'));
    }

    const completedFrame: CallStackFrame = {
      ...frame,
      status: 'completed',
      completedAt: Date.now()
    };

    const result: ExecutionResult = {
      success: true,
      executedTask: completedFrame,
      stateChange: { callStack: [...this.state.callStack] },
      sideEffects: []
    };

    this.recordExecution(result);
    return result;
  }

  // 마이크로태스크 추가
  enqueueMicrotask(task: Omit<MicrotaskItem, 'id' | 'createdAt' | 'status'>): ExecutionResult {
    if (this.state.microtaskQueue.length >= this.config.maxMicrotaskQueueSize) {
      return this.createErrorResult(new Error('Microtask queue is full'));
    }

    const newTask: MicrotaskItem = {
      ...task,
      id: this.generateTaskId(),
      createdAt: Date.now(),
      status: 'pending',
      type: 'microtask'
    };

    this.state.microtaskQueue.push(newTask);

    const result: ExecutionResult = {
      success: true,
      stateChange: { microtaskQueue: [...this.state.microtaskQueue] },
      sideEffects: [{
        type: 'console',
        description: `Microtask "${newTask.name}" queued`,
        timestamp: Date.now()
      }]
    };

    this.recordExecution(result);
    return result;
  }

  // 매크로태스크 추가
  enqueueMacrotask(task: Omit<MacrotaskItem, 'id' | 'createdAt' | 'status'>): ExecutionResult {
    if (this.state.macrotaskQueue.length >= this.config.maxMacrotaskQueueSize) {
      return this.createErrorResult(new Error('Macrotask queue is full'));
    }

    const newTask: MacrotaskItem = {
      ...task,
      id: this.generateTaskId(),
      createdAt: Date.now(),
      scheduledAt: Date.now() + (task.delay || 0),
      status: 'pending',
      type: 'macrotask'
    };

    // 지연 시간에 따라 정렬하여 삽입
    const insertIndex = this.findInsertIndex(newTask);
    this.state.macrotaskQueue.splice(insertIndex, 0, newTask);

    const result: ExecutionResult = {
      success: true,
      stateChange: { macrotaskQueue: [...this.state.macrotaskQueue] },
      sideEffects: [{
        type: 'timer',
        description: `Macrotask "${newTask.name}" scheduled with ${task.delay || 0}ms delay`,
        timestamp: Date.now()
      }]
    };

    this.recordExecution(result);
    return result;
  }

  // 한 틱 실행
  tick(): ExecutionResult {
    this.state.currentTick++;
    this.state.isRunning = true;

    try {
      // 1. 콜스택이 비어있고 마이크로태스크가 있으면 마이크로태스크 처리
      if (this.policy.shouldProcessMicrotasks() && this.state.microtaskQueue.length > 0) {
        const microtaskResult = this.processAllMicrotasks();
        if (!microtaskResult.success) {
          return microtaskResult;
        }
        // 마이크로태스크를 처리했으면 이번 틱 종료
      } else if (this.policy.shouldProcessMacrotask()) {
        // 2. 콜스택과 마이크로태스크 큐가 모두 비어있으면 매크로태스크 처리
        const macrotaskResult = this.processOneMacrotask();
        if (!macrotaskResult.success) {
          return macrotaskResult;
        }
      }

      // 3. 모든 큐가 비어있으면 idle 상태로 전환
      if (this.isAllQueuesEmpty()) {
        this.state.phase = 'idle';
        this.state.isRunning = false;
      }

      const result: ExecutionResult = {
        success: true,
        stateChange: { 
          currentTick: this.state.currentTick,
          phase: this.state.phase,
          isRunning: this.state.isRunning
        },
        sideEffects: []
      };

      this.notifyTickCallbacks();
      return result;

    } catch (error) {
      this.state.isRunning = false;
      return this.createErrorResult(error as Error);
    }
  }

  // 모든 마이크로태스크 처리
  private processAllMicrotasks(): ExecutionResult {
    const results: ExecutionResult[] = [];
    const sideEffects: SideEffect[] = [];

    try {
      while (this.state.microtaskQueue.length > 0) {
        const task = this.state.microtaskQueue.shift()!;
        
        // 태스크 유효성 검사
        if (!task || !task.name) {
          return {
            success: false,
            error: new Error('Invalid microtask: missing required properties'),
            stateChange: {},
            sideEffects
          };
        }
        
        const executingTask: MicrotaskItem = {
          ...task,
          status: 'executing',
          executedAt: Date.now()
        };

        // 실제 실행 시뮬레이션
        const completedTask: MicrotaskItem = {
          ...executingTask,
          status: 'completed',
          completedAt: Date.now()
        };

        sideEffects.push({
          type: 'console',
          description: `Executed microtask: ${completedTask.name}`,
          timestamp: Date.now()
        });

        results.push({
          success: true,
          executedTask: completedTask,
          stateChange: { microtaskQueue: [...this.state.microtaskQueue] },
          sideEffects: [sideEffects[sideEffects.length - 1]]
        });
      }

      return {
        success: true,
        stateChange: { 
          microtaskQueue: [],
          phase: 'check'
        },
        sideEffects
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects
      };
    }
  }

  // 하나의 매크로태스크 처리
  private processOneMacrotask(): ExecutionResult {
    try {
      const now = Date.now();
      const readyTask = this.state.macrotaskQueue.find(
        task => !task.scheduledAt || task.scheduledAt <= now
      );

      if (!readyTask) {
        return {
          success: true,
          stateChange: { phase: 'poll' },
          sideEffects: []
        };
      }

      // 태스크 유효성 검사
      if (!readyTask.name) {
        return {
          success: false,
          error: new Error('Invalid macrotask: missing required properties'),
          stateChange: {},
          sideEffects: []
        };
      }

      const taskIndex = this.state.macrotaskQueue.indexOf(readyTask);
      if (taskIndex === -1) {
        return {
          success: false,
          error: new Error('Macrotask not found in queue'),
          stateChange: {},
          sideEffects: []
        };
      }
      
      this.state.macrotaskQueue.splice(taskIndex, 1);

      const executingTask: MacrotaskItem = {
        ...readyTask,
        status: 'executing',
        executedAt: Date.now()
      };

      // 실제 실행 시뮬레이션
      const completedTask: MacrotaskItem = {
        ...executingTask,
        status: 'completed',
        completedAt: Date.now()
      };

      return {
        success: true,
        executedTask: completedTask,
        stateChange: { 
          macrotaskQueue: [...this.state.macrotaskQueue],
          phase: 'timers'
        },
        sideEffects: [{
          type: 'console',
          description: `Executed macrotask: ${completedTask.name}`,
          timestamp: Date.now()
        }]
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }

  // 상태 리셋
  reset(): void {
    this.state = this.createInitialState();
    this.executionHistory = [];
  }

  // 특정 시점으로 되돌리기 (Time Travel)
  rewindToTick(targetTick: number): EventLoopState {
    if (targetTick < 0 || targetTick > this.state.currentTick) {
      throw new Error('Invalid tick number');
    }

    // 초기 상태에서 시작하여 목표 틱까지 재실행
    const tempEngine = new EventLoopEngine(this.config, this.policy);
    
    // 실행 이력을 재생하여 상태 복원
    for (let i = 0; i < targetTick; i++) {
      tempEngine.tick();
    }

    return tempEngine.getState();
  }

  // 틱 콜백 등록
  onTick(callback: (state: EventLoopState) => void): () => void {
    this.tickCallbacks.push(callback);
    
    // unsubscribe 함수 반환
    return () => {
      const index = this.tickCallbacks.indexOf(callback);
      if (index > -1) {
        this.tickCallbacks.splice(index, 1);
      }
    };
  }

  // Private 헬퍼 메서드들
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private findInsertIndex(task: MacrotaskItem): number {
    const scheduledAt = task.scheduledAt || 0;
    
    for (let i = 0; i < this.state.macrotaskQueue.length; i++) {
      const currentTaskScheduledAt = this.state.macrotaskQueue[i].scheduledAt || 0;
      if (scheduledAt < currentTaskScheduledAt) {
        return i;
      }
    }
    
    return this.state.macrotaskQueue.length;
  }

  private isAllQueuesEmpty(): boolean {
    return (
      this.state.callStack.length === 0 &&
      this.state.microtaskQueue.length === 0 &&
      this.state.macrotaskQueue.length === 0
    );
  }

  private createErrorResult(error: Error): ExecutionResult {
    return {
      success: false,
      error,
      stateChange: {},
      sideEffects: [{
        type: 'console',
        description: `Error: ${error.message}`,
        timestamp: Date.now()
      }]
    };
  }

  private recordExecution(result: ExecutionResult): void {
    this.executionHistory.push(result);
    
    if (this.config.enableLogging) {
      console.log('[EventLoopEngine]', result);
    }
  }

  private notifyTickCallbacks(): void {
    const currentState = this.getState();
    this.tickCallbacks.forEach(callback => callback(currentState));
  }
}