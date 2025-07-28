/**
 * Event Loop 도메인 타입 정의
 * 
 * JavaScript Event Loop의 핵심 개념을 도메인 모델로 표현
 * UI나 프레임워크에 의존하지 않는 순수한 비즈니스 로직
 */

// 기본 타입 정의
export type TaskId = string;
export type Priority = 'immediate' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'executing' | 'completed' | 'failed';

// 실행 컨텍스트
export interface ExecutionContext {
  id: string;
  functionName: string;
  scope: Record<string, any>;
  timestamp: number;
}

// 태스크 기본 인터페이스
export interface Task {
  id: TaskId;
  name: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: number;
  scheduledAt?: number;
  executedAt?: number;
  completedAt?: number;
  context?: ExecutionContext;
}

// 큐 타입별 태스크
export interface CallStackFrame extends Task {
  type: 'callstack';
  returnValue?: any;
  error?: Error;
}

export interface MicrotaskItem extends Task {
  type: 'microtask';
  source: 'promise' | 'queueMicrotask' | 'mutationObserver';
}

export interface MacrotaskItem extends Task {
  type: 'macrotask';
  source: 'setTimeout' | 'setInterval' | 'setImmediate' | 'io' | 'ui';
  delay?: number;
}

// 큐 인터페이스
export interface Queue<T extends Task> {
  items: T[];
  maxSize: number;
  
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  clear(): void;
  size(): number;
  isFull(): boolean;
  isEmpty(): boolean;
}

// 이벤트 루프 상태
export interface EventLoopState {
  phase: 'idle' | 'poll' | 'check' | 'close' | 'timers' | 'pending';
  isRunning: boolean;
  currentTick: number;
  callStack: CallStackFrame[];
  microtaskQueue: MicrotaskItem[];
  macrotaskQueue: MacrotaskItem[];
}

// 실행 결과
export interface ExecutionResult {
  success: boolean;
  executedTask?: Task;
  error?: Error;
  stateChange: Partial<EventLoopState>;
  sideEffects: SideEffect[];
}

// 부수 효과
export interface SideEffect {
  type: 'console' | 'dom' | 'network' | 'timer';
  description: string;
  timestamp: number;
}

// 이벤트 루프 설정
export interface EventLoopConfig {
  maxCallStackSize: number;
  maxMicrotaskQueueSize: number;
  maxMacrotaskQueueSize: number;
  executionTimeout: number;
  enableLogging: boolean;
}

// 실행 정책
export interface ExecutionPolicy {
  shouldProcessMicrotasks(): boolean;
  shouldProcessMacrotask(): boolean;
  getNextMacrotask(): MacrotaskItem | undefined;
  handleStackOverflow(): void;
  handleTimeout(): void;
}