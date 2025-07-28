/**
 * EventSourcedEventLoopEngine - Event Sourcing 기반 이벤트 루프 엔진
 * 
 * 모든 상태 변화를 이벤트로 기록하고 재생할 수 있는 이벤트 루프 엔진
 * 완벽한 시간 여행 디버깅과 상태 추적을 제공
 */

import {
  DomainEvent,
  EventMetadata,
  IEventStore,
  InMemoryEventStore,
  createEvent
} from './EventStore';
import {
  EventLoopState,
  EventLoopConfig,
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem,
  ExecutionResult,
  Task
} from '../event-loop/types';

// 이벤트 루프 관련 이벤트 타입들
export const EventLoopEventTypes = {
  // 콜스택 이벤트
  FUNCTION_PUSHED: 'eventloop.function.pushed',
  FUNCTION_POPPED: 'eventloop.function.popped',
  STACK_OVERFLOW: 'eventloop.stack.overflow',
  
  // 마이크로태스크 이벤트
  MICROTASK_ENQUEUED: 'eventloop.microtask.enqueued',
  MICROTASK_DEQUEUED: 'eventloop.microtask.dequeued',
  MICROTASK_EXECUTED: 'eventloop.microtask.executed',
  
  // 매크로태스크 이벤트
  MACROTASK_ENQUEUED: 'eventloop.macrotask.enqueued',
  MACROTASK_DEQUEUED: 'eventloop.macrotask.dequeued',
  MACROTASK_EXECUTED: 'eventloop.macrotask.executed',
  
  // 실행 이벤트
  TICK_STARTED: 'eventloop.tick.started',
  TICK_COMPLETED: 'eventloop.tick.completed',
  PHASE_CHANGED: 'eventloop.phase.changed',
  
  // 에러 이벤트
  EXECUTION_ERROR: 'eventloop.execution.error',
  
  // 시스템 이벤트
  ENGINE_RESET: 'eventloop.engine.reset',
  ENGINE_CONFIGURED: 'eventloop.engine.configured'
} as const;

// 이벤트 페이로드 타입들
export interface FunctionPushedPayload {
  function: CallStackFrame;
  stackSize: number;
}

export interface FunctionPoppedPayload {
  function: CallStackFrame;
  stackSize: number;
  returnValue?: any;
}

export interface MicrotaskEnqueuedPayload {
  task: MicrotaskItem;
  queueSize: number;
  position: number;
}

export interface MacrotaskEnqueuedPayload {
  task: MacrotaskItem;
  queueSize: number;
  scheduledAt: number;
}

export interface TickStartedPayload {
  tickNumber: number;
  currentPhase: EventLoopState['phase'];
  queueSizes: {
    callstack: number;
    microtask: number;
    macrotask: number;
  };
}

export interface PhaseChangedPayload {
  fromPhase: EventLoopState['phase'];
  toPhase: EventLoopState['phase'];
  reason: string;
}

// Event Sourcing 기반 이벤트 루프 엔진
export class EventSourcedEventLoopEngine {
  private eventStore: IEventStore;
  private aggregateId: string;
  private version: number = 0;
  private currentState: EventLoopState;
  private config: EventLoopConfig;
  private sessionId: string;

  constructor(
    config: EventLoopConfig,
    eventStore?: IEventStore,
    aggregateId?: string
  ) {
    this.config = config;
    this.eventStore = eventStore || new InMemoryEventStore();
    this.aggregateId = aggregateId || `eventloop_${Date.now()}`;
    this.sessionId = `session_${Date.now()}`;
    this.currentState = this.createInitialState();

    // 초기 설정 이벤트 기록
    this.recordEvent(EventLoopEventTypes.ENGINE_CONFIGURED, {
      config: this.config,
      aggregateId: this.aggregateId
    });
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

  // 현재 상태 조회
  getState(): Readonly<EventLoopState> {
    return { ...this.currentState };
  }

  // 이벤트 기록
  private async recordEvent(
    eventType: string,
    payload: Record<string, any>,
    metadata?: Partial<EventMetadata>
  ): Promise<DomainEvent> {
    this.version += 1;

    const event = createEvent(
      eventType,
      this.aggregateId,
      'EventLoopEngine',
      this.version,
      payload,
      {
        sessionId: this.sessionId,
        source: 'EventSourcedEventLoopEngine',
        ...metadata
      }
    );

    await this.eventStore.appendEvents(this.aggregateId, this.version - 1, [event]);
    
    // 이벤트 적용하여 상태 업데이트
    this.applyEvent(event);
    
    return event;
  }

  // 이벤트를 현재 상태에 적용
  private applyEvent(event: DomainEvent): void {
    const { type, payload } = event;

    switch (type) {
      case EventLoopEventTypes.FUNCTION_PUSHED:
        const pushPayload = payload as FunctionPushedPayload;
        this.currentState.callStack.push(pushPayload.function);
        break;

      case EventLoopEventTypes.FUNCTION_POPPED:
        this.currentState.callStack.pop();
        break;

      case EventLoopEventTypes.MICROTASK_ENQUEUED:
        const microPayload = payload as MicrotaskEnqueuedPayload;
        this.currentState.microtaskQueue.splice(microPayload.position, 0, microPayload.task);
        break;

      case EventLoopEventTypes.MICROTASK_DEQUEUED:
        this.currentState.microtaskQueue.shift();
        break;

      case EventLoopEventTypes.MACROTASK_ENQUEUED:
        const macroPayload = payload as MacrotaskEnqueuedPayload;
        // 스케줄 시간에 따라 정렬하여 삽입
        const insertIndex = this.findMacrotaskInsertIndex(macroPayload.scheduledAt);
        this.currentState.macrotaskQueue.splice(insertIndex, 0, macroPayload.task);
        break;

      case EventLoopEventTypes.MACROTASK_DEQUEUED:
        const taskId = payload.taskId;
        const taskIndex = this.currentState.macrotaskQueue.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          this.currentState.macrotaskQueue.splice(taskIndex, 1);
        }
        break;

      case EventLoopEventTypes.TICK_STARTED:
        const tickPayload = payload as TickStartedPayload;
        this.currentState.currentTick = tickPayload.tickNumber;
        this.currentState.isRunning = true;
        break;

      case EventLoopEventTypes.TICK_COMPLETED:
        this.currentState.isRunning = false;
        break;

      case EventLoopEventTypes.PHASE_CHANGED:
        const phasePayload = payload as PhaseChangedPayload;
        this.currentState.phase = phasePayload.toPhase;
        break;

      case EventLoopEventTypes.ENGINE_RESET:
        this.currentState = this.createInitialState();
        break;

      default:
        // 알 수 없는 이벤트는 무시
        break;
    }
  }

  // 매크로태스크 삽입 위치 찾기
  private findMacrotaskInsertIndex(scheduledAt: number): number {
    for (let i = 0; i < this.currentState.macrotaskQueue.length; i++) {
      const taskScheduledAt = this.currentState.macrotaskQueue[i].scheduledAt || 0;
      if (scheduledAt < taskScheduledAt) {
        return i;
      }
    }
    return this.currentState.macrotaskQueue.length;
  }

  // 콜스택에 함수 추가
  async pushToCallStack(frame: Omit<CallStackFrame, 'id' | 'createdAt' | 'status'>): Promise<ExecutionResult> {
    try {
      if (this.currentState.callStack.length >= this.config.maxCallStackSize) {
        await this.recordEvent(EventLoopEventTypes.STACK_OVERFLOW, {
          maxSize: this.config.maxCallStackSize,
          currentSize: this.currentState.callStack.length,
          attemptedFunction: frame.name
        });
        
        return {
          success: false,
          error: new Error('Maximum call stack size exceeded'),
          stateChange: {},
          sideEffects: []
        };
      }

      const newFrame: CallStackFrame = {
        ...frame,
        id: this.generateTaskId(),
        createdAt: Date.now(),
        status: 'pending',
        type: 'callstack'
      };

      await this.recordEvent(EventLoopEventTypes.FUNCTION_PUSHED, {
        function: newFrame,
        stackSize: this.currentState.callStack.length + 1
      });

      return {
        success: true,
        stateChange: { callStack: [...this.currentState.callStack] },
        sideEffects: [{
          type: 'console',
          description: `Function ${newFrame.name} pushed to call stack`,
          timestamp: Date.now()
        }]
      };

    } catch (error) {
      await this.recordEvent(EventLoopEventTypes.EXECUTION_ERROR, {
        error: (error as Error).message,
        operation: 'pushToCallStack',
        context: frame
      });

      // 동시성 충돌의 경우 예외를 다시 던짐
      if ((error as Error).message.includes('Concurrency conflict')) {
        throw error;
      }

      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }

  // 콜스택에서 함수 제거
  async popFromCallStack(): Promise<ExecutionResult> {
    try {
      if (this.currentState.callStack.length === 0) {
        return {
          success: false,
          error: new Error('Call stack is empty'),
          stateChange: {},
          sideEffects: []
        };
      }

      const poppedFrame = this.currentState.callStack[this.currentState.callStack.length - 1];
      
      await this.recordEvent(EventLoopEventTypes.FUNCTION_POPPED, {
        function: { ...poppedFrame, status: 'completed', completedAt: Date.now() },
        stackSize: this.currentState.callStack.length - 1
      });

      return {
        success: true,
        executedTask: { ...poppedFrame, status: 'completed' },
        stateChange: { callStack: [...this.currentState.callStack] },
        sideEffects: [{
          type: 'console',
          description: `Function ${poppedFrame.name} returned`,
          timestamp: Date.now()
        }]
      };

    } catch (error) {
      await this.recordEvent(EventLoopEventTypes.EXECUTION_ERROR, {
        error: (error as Error).message,
        operation: 'popFromCallStack'
      });

      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }

  // 마이크로태스크 추가
  async enqueueMicrotask(task: Omit<MicrotaskItem, 'id' | 'createdAt' | 'status'>): Promise<ExecutionResult> {
    try {
      if (this.currentState.microtaskQueue.length >= this.config.maxMicrotaskQueueSize) {
        return {
          success: false,
          error: new Error('Microtask queue is full'),
          stateChange: {},
          sideEffects: []
        };
      }

      const newTask: MicrotaskItem = {
        ...task,
        id: this.generateTaskId(),
        createdAt: Date.now(),
        status: 'pending',
        type: 'microtask'
      };

      // Promise 마이크로태스크는 높은 우선순위
      if (newTask.source === 'promise') {
        newTask.priority = 'high';
      }

      // 우선순위에 따른 삽입 위치 계산
      const insertPosition = this.calculateMicrotaskPosition(newTask.priority);

      await this.recordEvent(EventLoopEventTypes.MICROTASK_ENQUEUED, {
        task: newTask,
        queueSize: this.currentState.microtaskQueue.length + 1,
        position: insertPosition
      });

      return {
        success: true,
        stateChange: { microtaskQueue: [...this.currentState.microtaskQueue] },
        sideEffects: [{
          type: 'console',
          description: `Microtask ${newTask.name} enqueued`,
          timestamp: Date.now()
        }]
      };

    } catch (error) {
      await this.recordEvent(EventLoopEventTypes.EXECUTION_ERROR, {
        error: (error as Error).message,
        operation: 'enqueueMicrotask',
        context: task
      });

      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }

  // 매크로태스크 추가
  async enqueueMacrotask(task: Omit<MacrotaskItem, 'id' | 'createdAt' | 'status'>): Promise<ExecutionResult> {
    try {
      if (this.currentState.macrotaskQueue.length >= this.config.maxMacrotaskQueueSize) {
        return {
          success: false,
          error: new Error('Macrotask queue is full'),
          stateChange: {},
          sideEffects: []
        };
      }

      const scheduledAt = Date.now() + (task.delay || 0);
      const newTask: MacrotaskItem = {
        ...task,
        id: this.generateTaskId(),
        createdAt: Date.now(),
        scheduledAt,
        status: 'pending',
        type: 'macrotask'
      };

      await this.recordEvent(EventLoopEventTypes.MACROTASK_ENQUEUED, {
        task: newTask,
        queueSize: this.currentState.macrotaskQueue.length + 1,
        scheduledAt
      });

      return {
        success: true,
        stateChange: { macrotaskQueue: [...this.currentState.macrotaskQueue] },
        sideEffects: [{
          type: 'timer',
          description: `Macrotask ${newTask.name} scheduled for ${scheduledAt}`,
          timestamp: Date.now()
        }]
      };

    } catch (error) {
      // 에러 기록을 시도하되, 실패해도 원본 에러를 반환
      try {
        await this.recordEvent(EventLoopEventTypes.EXECUTION_ERROR, {
          error: (error as Error).message,
          operation: 'enqueueMacrotask',
          context: task
        });
      } catch (recordingError) {
        // 이벤트 기록 실패는 콘솔에만 로깅 (silent fail)
        console.warn('Failed to record execution error event:', recordingError);
      }

      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }

  // 한 틱 실행
  async tick(): Promise<ExecutionResult> {
    try {
      const nextTick = this.currentState.currentTick + 1;

      await this.recordEvent(EventLoopEventTypes.TICK_STARTED, {
        tickNumber: nextTick,
        currentPhase: this.currentState.phase,
        queueSizes: {
          callstack: this.currentState.callStack.length,
          microtask: this.currentState.microtaskQueue.length,
          macrotask: this.currentState.macrotaskQueue.length
        }
      });

      // 실행 로직
      const results: ExecutionResult[] = [];

      // 1. 마이크로태스크 처리
      if (this.currentState.callStack.length === 0 && this.currentState.microtaskQueue.length > 0) {
        await this.recordEvent(EventLoopEventTypes.PHASE_CHANGED, {
          fromPhase: this.currentState.phase,
          toPhase: 'check',
          reason: 'Processing microtasks'
        });

        while (this.currentState.microtaskQueue.length > 0) {
          const task = this.currentState.microtaskQueue[0];
          
          await this.recordEvent(EventLoopEventTypes.MICROTASK_DEQUEUED, {
            task: { ...task, status: 'executing', executedAt: Date.now() }
          });

          await this.recordEvent(EventLoopEventTypes.MICROTASK_EXECUTED, {
            task: { ...task, status: 'completed', completedAt: Date.now() }
          });
        }
      }

      // 2. 매크로태스크 처리
      if (this.shouldProcessMacrotask()) {
        const readyTask = this.getNextReadyMacrotask();
        if (readyTask) {
          await this.recordEvent(EventLoopEventTypes.PHASE_CHANGED, {
            fromPhase: this.currentState.phase,
            toPhase: 'timers',
            reason: 'Processing macrotask'
          });

          await this.recordEvent(EventLoopEventTypes.MACROTASK_DEQUEUED, {
            taskId: readyTask.id
          });

          await this.recordEvent(EventLoopEventTypes.MACROTASK_EXECUTED, {
            task: { ...readyTask, status: 'completed', completedAt: Date.now() }
          });
        }
      }

      // 3. 모든 큐가 비어있으면 idle
      if (this.isAllQueuesEmpty()) {
        await this.recordEvent(EventLoopEventTypes.PHASE_CHANGED, {
          fromPhase: this.currentState.phase,
          toPhase: 'idle',
          reason: 'All queues empty'
        });
      }

      await this.recordEvent(EventLoopEventTypes.TICK_COMPLETED, {
        tickNumber: nextTick,
        finalPhase: this.currentState.phase
      });

      return {
        success: true,
        stateChange: {
          currentTick: this.currentState.currentTick,
          phase: this.currentState.phase,
          isRunning: this.currentState.isRunning
        },
        sideEffects: []
      };

    } catch (error) {
      // 에러 기록을 시도하되, 실패해도 원본 에러를 반환
      try {
        await this.recordEvent(EventLoopEventTypes.EXECUTION_ERROR, {
          error: (error as Error).message,
          operation: 'tick'
        });
      } catch (recordingError) {
        // 이벤트 기록 실패는 콘솔에만 로깅 (silent fail)
        console.warn('Failed to record execution error event:', recordingError);
      }

      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }

  // 상태 리셋
  async reset(): Promise<void> {
    await this.recordEvent(EventLoopEventTypes.ENGINE_RESET, {
      previousVersion: this.version,
      timestamp: Date.now()
    });
  }

  // 시간 여행: 특정 버전으로 되돌리기
  async replayToVersion(targetVersion: number): Promise<EventLoopState> {
    if (targetVersion < 0 || targetVersion > this.version) {
      throw new Error(`Invalid version: ${targetVersion}`);
    }

    // 초기 상태에서 시작
    let replayState = this.createInitialState();
    
    // 대상 버전까지의 이벤트들을 순서대로 재생
    const events = await this.eventStore.getEvents(this.aggregateId, 1, targetVersion);
    
    // 새로운 독립적인 이벤트 스토어를 사용하여 동시성 충돌 방지
    const tempEventStore = new InMemoryEventStore();
    const tempEngine = new EventSourcedEventLoopEngine(this.config, tempEventStore, `${this.aggregateId}_replay_${Date.now()}`);
    
    // 이벤트들을 순서대로 적용 (ENGINE_CONFIGURED 이벤트 제외)
    for (const event of events) {
      if (event.type !== EventLoopEventTypes.ENGINE_CONFIGURED) {
        tempEngine.applyEvent(event);
      }
    }

    return tempEngine.getState();
  }

  // 이벤트 히스토리 조회
  async getEventHistory(): Promise<DomainEvent[]> {
    return this.eventStore.getEvents(this.aggregateId);
  }

  // 특정 타입의 이벤트만 조회
  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    const allEvents = await this.getEventHistory();
    return allEvents.filter(e => e.type === eventType);
  }

  // 헬퍼 메서드들
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateMicrotaskPosition(priority: string): number {
    const priorityOrder = { immediate: 0, high: 1, normal: 2, low: 3 };
    const priorityValue = priorityOrder[priority as keyof typeof priorityOrder] ?? 2;
    
    for (let i = 0; i < this.currentState.microtaskQueue.length; i++) {
      const currentPriorityValue = priorityOrder[this.currentState.microtaskQueue[i].priority as keyof typeof priorityOrder] ?? 2;
      if (priorityValue < currentPriorityValue) {
        return i;
      }
    }
    
    return this.currentState.microtaskQueue.length;
  }

  private shouldProcessMacrotask(): boolean {
    return (
      this.currentState.callStack.length === 0 &&
      this.currentState.microtaskQueue.length === 0 &&
      this.currentState.macrotaskQueue.length > 0
    );
  }

  private getNextReadyMacrotask(): MacrotaskItem | null {
    const now = Date.now();
    return this.currentState.macrotaskQueue.find(
      task => !task.scheduledAt || task.scheduledAt <= now
    ) || null;
  }

  private isAllQueuesEmpty(): boolean {
    return (
      this.currentState.callStack.length === 0 &&
      this.currentState.microtaskQueue.length === 0 &&
      this.currentState.macrotaskQueue.length === 0
    );
  }

  // 이벤트 스토어 접근자
  getEventStore(): IEventStore {
    return this.eventStore;
  }

  getAggregateId(): string {
    return this.aggregateId;
  }

  getVersion(): number {
    return this.version;
  }
}