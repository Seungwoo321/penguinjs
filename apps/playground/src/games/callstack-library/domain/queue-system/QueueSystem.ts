/**
 * QueueSystem - JavaScript의 큐 시스템 도메인 모델
 * 
 * CallStack, Microtask Queue, Macrotask Queue를 통합 관리하는 시스템
 * 각 큐의 특성을 반영한 도메인 로직 포함
 */

import {
  Queue,
  Task,
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem,
  TaskId,
  Priority
} from '@/games/callstack-library/domain/event-loop/types';

// 큐 구현 기본 클래스
abstract class BaseQueue<T extends Task> implements Queue<T> {
  protected _items: T[] = [];
  public readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get items(): T[] {
    return [...this._items];
  }

  enqueue(item: T): void {
    if (this.isFull()) {
      throw new Error(`${this.constructor.name} is full`);
    }
    this._items.push(item);
  }

  dequeue(): T | undefined {
    return this._items.shift();
  }

  peek(): T | undefined {
    return this._items[0];
  }

  clear(): void {
    this._items = [];
  }

  size(): number {
    return this._items.length;
  }

  isFull(): boolean {
    return this._items.length >= this.maxSize;
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }

  // 큐 내용을 복사하여 반환 (불변성 보장)
  toArray(): T[] {
    return [...this._items];
  }
}

// 콜스택 구현 (LIFO - Last In First Out)
export class CallStack extends BaseQueue<CallStackFrame> {
  constructor(maxSize: number = 10000) {
    super(maxSize);
  }

  // 스택은 push/pop 인터페이스 사용
  push(frame: CallStackFrame): void {
    this.enqueue(frame);
  }

  pop(): CallStackFrame | undefined {
    return this._items.pop(); // LIFO이므로 끝에서 제거
  }

  // Override: 스택은 마지막 요소를 peek
  peek(): CallStackFrame | undefined {
    return this._items[this._items.length - 1];
  }

  // 현재 실행 중인 함수 (스택의 최상단)
  getCurrentFrame(): CallStackFrame | undefined {
    return this.peek();
  }

  // 스택 추적 정보 생성
  getStackTrace(): string[] {
    return this._items
      .map((frame, index) => `  at ${frame.name} (${frame.context?.functionName || 'anonymous'})`)
      .reverse(); // 최신 호출이 위로 오도록
  }

  // 특정 함수가 스택에 있는지 확인
  contains(functionName: string): boolean {
    return this._items.some(frame => frame.name === functionName);
  }

  // 재귀 깊이 확인
  getRecursionDepth(functionName: string): number {
    return this._items.filter(frame => frame.name === functionName).length;
  }
}

// 마이크로태스크 큐 구현 (FIFO - First In First Out)
export class MicrotaskQueue extends BaseQueue<MicrotaskItem> {
  private priorityOrder: Map<Priority, number> = new Map([
    ['immediate', 0],
    ['high', 1],
    ['normal', 2],
    ['low', 3]
  ]);

  constructor(maxSize: number = 1000) {
    super(maxSize);
  }

  // Override: 우선순위를 고려한 삽입
  enqueue(item: MicrotaskItem): void {
    if (this.isFull()) {
      throw new Error('Microtask queue is full');
    }

    // Promise 마이크로태스크는 항상 높은 우선순위
    if (item.source === 'promise') {
      item.priority = 'high';
    }

    // 우선순위에 따라 적절한 위치에 삽입
    const insertIndex = this.findInsertPosition(item.priority);
    this._items.splice(insertIndex, 0, item);
  }

  // 우선순위에 따른 삽입 위치 찾기
  private findInsertPosition(priority: Priority): number {
    const priorityValue = this.priorityOrder.get(priority) ?? 2;
    
    for (let i = 0; i < this._items.length; i++) {
      const currentPriorityValue = this.priorityOrder.get(this._items[i].priority) ?? 2;
      if (priorityValue < currentPriorityValue) {
        return i;
      }
    }
    
    return this._items.length;
  }

  // 특정 소스의 마이크로태스크만 필터링
  getBySource(source: MicrotaskItem['source']): MicrotaskItem[] {
    return this._items.filter(item => item.source === source);
  }

  // 모든 Promise 마이크로태스크 처리 (높은 우선순위)
  drainPromises(): MicrotaskItem[] {
    const promises = this.getBySource('promise');
    this._items = this._items.filter(item => item.source !== 'promise');
    return promises;
  }
}

// 매크로태스크 큐 구현 (FIFO with scheduling)
export class MacrotaskQueue extends BaseQueue<MacrotaskItem> {
  constructor(maxSize: number = 1000) {
    super(maxSize);
  }

  // Override: 스케줄 시간을 고려한 삽입
  enqueue(item: MacrotaskItem): void {
    if (this.isFull()) {
      throw new Error('Macrotask queue is full');
    }

    // 스케줄 시간이 없으면 현재 시간
    if (!item.scheduledAt) {
      item.scheduledAt = Date.now() + (item.delay || 0);
    }

    // 스케줄 시간 순으로 정렬하여 삽입
    const insertIndex = this.findScheduledPosition(item.scheduledAt);
    this._items.splice(insertIndex, 0, item);
  }

  // 스케줄 시간에 따른 삽입 위치 찾기
  private findScheduledPosition(scheduledAt: number): number {
    for (let i = 0; i < this._items.length; i++) {
      if (scheduledAt < (this._items[i].scheduledAt || 0)) {
        return i;
      }
    }
    return this._items.length;
  }

  // 실행 가능한 태스크만 반환 (현재 시간 기준)
  getReadyTasks(currentTime: number = Date.now()): MacrotaskItem[] {
    return this._items.filter(item => 
      !item.scheduledAt || item.scheduledAt <= currentTime
    );
  }

  // 다음 실행 가능한 태스크 반환
  dequeueReady(currentTime: number = Date.now()): MacrotaskItem | undefined {
    const readyIndex = this._items.findIndex(item =>
      !item.scheduledAt || item.scheduledAt <= currentTime
    );

    if (readyIndex === -1) {
      return undefined;
    }

    return this._items.splice(readyIndex, 1)[0];
  }

  // 특정 소스의 태스크 취소
  cancelBySource(source: MacrotaskItem['source']): MacrotaskItem[] {
    const cancelled = this._items.filter(item => item.source === source);
    this._items = this._items.filter(item => item.source !== source);
    return cancelled;
  }

  // 다음 스케줄된 시간 반환
  getNextScheduledTime(): number | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    
    const futureTimes = this._items
      .map(item => item.scheduledAt || 0)
      .filter(time => time > Date.now());
    
    if (futureTimes.length === 0) {
      return undefined;
    }
    
    return Math.min(...futureTimes);
  }
}

// 통합 큐 시스템
export class QueueSystem {
  public readonly callStack: CallStack;
  public readonly microtaskQueue: MicrotaskQueue;
  public readonly macrotaskQueue: MacrotaskQueue;

  constructor(config?: {
    maxCallStackSize?: number;
    maxMicrotaskQueueSize?: number;
    maxMacrotaskQueueSize?: number;
  }) {
    this.callStack = new CallStack(config?.maxCallStackSize || 10000);
    this.microtaskQueue = new MicrotaskQueue(config?.maxMicrotaskQueueSize || 1000);
    this.macrotaskQueue = new MacrotaskQueue(config?.maxMacrotaskQueueSize || 1000);
  }

  // 모든 큐가 비어있는지 확인
  isEmpty(): boolean {
    return (
      this.callStack.isEmpty() &&
      this.microtaskQueue.isEmpty() &&
      this.macrotaskQueue.isEmpty()
    );
  }

  // 전체 시스템 상태 스냅샷
  getSnapshot(): QueueSystemSnapshot {
    return {
      timestamp: Date.now(),
      callStack: this.callStack.toArray(),
      microtaskQueue: this.microtaskQueue.toArray(),
      macrotaskQueue: this.macrotaskQueue.toArray(),
      stats: {
        callStackSize: this.callStack.size(),
        microtaskQueueSize: this.microtaskQueue.size(),
        macrotaskQueueSize: this.macrotaskQueue.size(),
        totalTasks: this.getTotalTaskCount()
      }
    };
  }

  // 스냅샷에서 상태 복원
  restoreFromSnapshot(snapshot: QueueSystemSnapshot): void {
    this.callStack.clear();
    this.microtaskQueue.clear();
    this.macrotaskQueue.clear();

    snapshot.callStack.forEach(frame => this.callStack.push(frame));
    snapshot.microtaskQueue.forEach(task => this.microtaskQueue.enqueue(task));
    snapshot.macrotaskQueue.forEach(task => this.macrotaskQueue.enqueue(task));
  }

  // 전체 태스크 수
  getTotalTaskCount(): number {
    return (
      this.callStack.size() +
      this.microtaskQueue.size() +
      this.macrotaskQueue.size()
    );
  }

  // 시스템 리셋
  reset(): void {
    this.callStack.clear();
    this.microtaskQueue.clear();
    this.macrotaskQueue.clear();
  }

  // 디버그 정보 생성
  getDebugInfo(): string {
    const lines: string[] = [
      '=== Queue System Debug Info ===',
      `CallStack (${this.callStack.size()}/${this.callStack.maxSize}):`,
      ...this.callStack.getStackTrace().slice(0, 5),
      this.callStack.size() > 5 ? `  ... and ${this.callStack.size() - 5} more` : '',
      '',
      `Microtask Queue (${this.microtaskQueue.size()}/${this.microtaskQueue.maxSize}):`,
      ...this.microtaskQueue.items.slice(0, 3).map(task => 
        `  - ${task.name} (${task.source}, ${task.priority})`
      ),
      this.microtaskQueue.size() > 3 ? `  ... and ${this.microtaskQueue.size() - 3} more` : '',
      '',
      `Macrotask Queue (${this.macrotaskQueue.size()}/${this.macrotaskQueue.maxSize}):`,
      ...this.macrotaskQueue.items.slice(0, 3).map(task => 
        `  - ${task.name} (${task.source}, scheduled: ${task.scheduledAt || 'immediate'})`
      ),
      this.macrotaskQueue.size() > 3 ? `  ... and ${this.macrotaskQueue.size() - 3} more` : '',
    ];

    return lines.filter(line => line).join('\n');
  }
}

// 큐 시스템 스냅샷 타입
export interface QueueSystemSnapshot {
  timestamp: number;
  callStack: CallStackFrame[];
  microtaskQueue: MicrotaskItem[];
  macrotaskQueue: MacrotaskItem[];
  stats: {
    callStackSize: number;
    microtaskQueueSize: number;
    macrotaskQueueSize: number;
    totalTasks: number;
  };
}

// 큐 시스템 이벤트
export interface QueueSystemEvent {
  type: 'enqueue' | 'dequeue' | 'clear' | 'overflow';
  queue: 'callstack' | 'microtask' | 'macrotask';
  task?: Task;
  timestamp: number;
  metadata?: Record<string, any>;
}