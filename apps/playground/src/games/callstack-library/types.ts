// 콜스택 아이템 (책)
export interface StackItem {
  id: string
  functionName: string
  returnValue?: string | number | boolean | null | any[]
  color: string
  height: number
  queueType?: QueueType
  priority?: number
  timestamp?: number
  isGlobalContext?: boolean  // 전역 실행 컨텍스트 여부
}

// 큐 타입 정의
export type QueueType = 
  | 'callstack'      // 기본 콜스택
  | 'microtask'      // 마이크로태스크 큐
  | 'macrotask'      // 매크로태스크 큐  
  | 'priority'       // 우선순위 큐
  | 'circular'       // 원형 큐
  | 'deque'          // 덱 (양방향 큐)
  | 'animation'      // 애니메이션 프레임 큐
  | 'immediate'      // setImmediate 큐
  | 'idle'           // requestIdleCallback 큐

// 큐 아이템 (다양한 큐 타입을 위한 확장된 인터페이스)
export interface QueueItem {
  id: string
  functionName: string
  returnValue?: string | number | boolean | null | any[]
  color: string
  height: number
  queueType: QueueType
  priority?: number
  timestamp?: number
  data?: Record<string, unknown>
  position?: number
}

// 큐 시각화 설정
export interface QueueVisualConfig {
  type: QueueType
  name: string
  color: string
  maxSize: number
  fifo: boolean // true: FIFO, false: LIFO
  description: string
  icon: string
  animationDuration: number
}

// 비동기 태스크 정보
export interface AsyncTask {
  type: 'microtask' | 'macrotask'
  name: string
  calls: FunctionCall[]
}

// 함수 호출 정보
export interface FunctionCall {
  name: string
  params?: Array<string | number | boolean | null | any[]>
  returns?: string | number | boolean | null | any[]
  calls?: FunctionCall[]
  queueType?: QueueType
  priority?: number
  delay?: number
  position?: number
  createsTask?: {
    type: 'microtask' | 'macrotask'
    name: string
  }
}

// 레이아웃 타입 정의
export type LayoutType = 'A' | 'A+' | 'B' | 'C' | 'D' | 'E'

// 실행 단계 정보 (타입 E용)
export interface ExecutionStep {
  step: number
  description: string
  currentLine: number
}

// 콜스택 게임 레벨 (독립적인 타입)
export interface CallStackLevel {
  id: string
  title: string
  description: string
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  stageNumber: number
  layoutType?: LayoutType
  code: string
  functionCalls: FunctionCall[]
  asyncTasks?: AsyncTask[]
  expectedOrder: string[]
  simulationSteps?: string[] // 시뮬레이션을 위한 단계별 액션
  maxStackSize: number
  hints: string[]
  concepts: string[]
  queueTypes?: QueueType[] // 이 레벨에서 사용되는 큐 타입들
  
  // 타입 E 전용 필드들
  executionSteps?: ExecutionStep[]
  breakpoints?: number[]
  snapshotCheckpoints?: number[]
  expectedSnapshots?: Record<number, StackItem[]>
  
  // 타입 B, C, D 전용 필드들
  eventLoopSteps?: any[] // EventLoopStep 타입이 별도로 정의되어 있을 수 있음
}

// 확장된 게임 상태
export interface CallStackGameState {
  currentStack: StackItem[]
  executionOrder: string[]
  isExecuting: boolean
  currentFunction: string | null
  stackOverflow: boolean
  queues: Record<QueueType, QueueItem[]>
  currentlyExecutingQueue?: QueueType
  queueVisualConfigs: Record<QueueType, QueueVisualConfig>
}