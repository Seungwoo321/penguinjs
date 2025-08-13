// 레이아웃 시스템 관련 타입 정의

import { ReactNode } from 'react'
import { PlayMode } from '@/games/callstack-library/utils/layoutClassifier'
import { QueueType, QueueItem, LayoutType } from '@/games/callstack-library/types'

// Layout B 전용 타입들
export interface QueueStatesSnapshot {
  callstack: QueueItem[]
  microtask: QueueItem[]
  macrotask: QueueItem[]
  animation?: QueueItem[]
  generator?: QueueItem[]
  worker?: QueueItem[]
  priority?: QueueItem[]
  io?: QueueItem[]
  network?: QueueItem[]
  step: number
  timestamp: number
}

export interface EventLoopStep {
  id: string
  step: number
  description: string
  beforeState: QueueStatesSnapshot
  afterState: QueueStatesSnapshot
  executedItems: QueueItem[]
  currentLine: number
}

export interface QueueValidationResult {
  callstack: boolean
  microtask: boolean
  macrotask: boolean
  isValid: boolean
  message?: string
}

// 게임 데이터 인터페이스
export interface GameData {
  currentCode: string
  currentLine?: number
  callstack: any[]
  availableFunctions: string[]
  userAnswer: string[]
  executionSteps?: any[]
  currentStep?: number
  expectedCount?: number
  hints?: string[]
  showHints?: boolean
  hintsUsed?: number
  isExecuting?: boolean
  // 타입 E 전용
  callstackHistory?: any[][]  // 각 스텝별 콜스택 상태
  currentDisplayStack?: any[] // 현재 표시할 스택 (이중 스택 시스템용)
  isTimelinePlaying?: boolean
  breakpoints?: number[]
  executionPath?: number[]
  userSnapshots?: Record<number, any[]>
  snapshotCheckpoints?: number[]
  validationResults?: Record<number, boolean>
  // Layout B 전용
  queueStates?: Record<number, QueueStatesSnapshot>
  currentQueueStates?: QueueStatesSnapshot
  eventLoopSteps?: EventLoopStep[]
  queueValidationResults?: Record<number, QueueValidationResult>
  highlightedQueue?: string
}

// 게임 핸들러 인터페이스
export interface GameHandlers {
  onFunctionSelect: (functionName: string) => void
  onSnapshotChange?: (step: number, snapshot: any) => void
  onSubmit: () => void
  onReset?: () => void
  onHint?: () => void
  onSimulate?: () => void
  onReorderFunctions?: (newOrder: string[]) => void
  onRemoveFunction?: (index: number) => void
  // 타입 E 전용
  onStepChange?: (step: number) => void
  onPlayPause?: () => void
  onAddToSnapshot?: (funcName: string) => void
  onRemoveFromSnapshot?: (index: number) => void
  onValidateSnapshot?: () => void
  onReorderSnapshot?: (step: number, newOrder: any[]) => void
  // Layout B 전용
  onQueueStateChange?: (step: number, queueStates: QueueStatesSnapshot) => void
  onValidateQueueStep?: (step: number) => void
  onQueueItemClick?: (queueType: string, item: QueueItem) => void
  onAddToQueue?: (queueType: QueueType, funcName: string) => void
  onRemoveFromQueue?: (queueType: QueueType, index: number) => void
}

// 레이아웃 렌더러 Props
export interface LayoutRendererProps {
  layoutType: LayoutType
  gameData: GameData
  gameHandlers: GameHandlers
  className?: string
}

// 패널 컴포넌트 공통 Props
export interface PanelProps {
  className?: string
  children?: ReactNode
}

// 코드 에디터 패널 Props
export interface CodeEditorPanelProps extends PanelProps {
  code: string
  highlightedLine?: number
}

// 콜스택 시각화 패널 Props
export interface CallStackVisualizationPanelProps extends PanelProps {
  callstack: any[]
  queues?: string[]
  layoutType: LayoutType
}

// 함수 선택기 패널 Props
export interface FunctionSelectorPanelProps extends PanelProps {
  functions: string[]
  playMode: PlayMode
  selectedFunctions: string[]
  onFunctionSelect: (functionName: string) => void
  onReorder?: (newOrder: string[]) => void
  onRemove?: (index: number) => void
}

// 스냅샷 빌더 패널 Props  
export interface SnapshotBuilderPanelProps extends PanelProps {
  executionSteps: any[]
  currentStep: number
  onSnapshotChange: (step: number, snapshot: any) => void
}

// 평가 패널 Props
export interface EvaluationPanelProps extends PanelProps {
  layoutType: LayoutType
  evaluation: {
    checkOrder: boolean
    checkLifoPrinciple: boolean
    checkSnapshots: boolean
    checkQueueStates: boolean
  }
  userAnswer: any
  onSubmit: () => void
  onHint?: () => void
  onSimulate?: () => void
  onReset?: () => void
  expectedCount?: number
  snapshotCheckpoints?: number[]
  validationResults?: Record<number, boolean>
}

// Layout B 전용 패널 Props
export interface MultiQueueVisualizationPanelProps extends PanelProps {
  queueStates: QueueStatesSnapshot
  isExecuting: boolean
  highlightedQueue?: string
  onQueueItemClick?: (queueType: string, item: QueueItem) => void
  maxSize?: number
}

export interface QueueSnapshotBuilderPanelProps extends PanelProps {
  executionSteps: EventLoopStep[]
  currentStep: number
  queueStates: Record<number, QueueStatesSnapshot>
  onQueueStateChange: (step: number, queueStates: QueueStatesSnapshot) => void
  onValidateQueueStep: (step: number) => void
  validationResults: Record<number, QueueValidationResult>
  availableFunctions: string[]
  queueTypes?: string[] // 타입 C, D에서 사용할 큐 타입 목록
}

// 오른쪽 패널 Props
export interface RightPanelProps extends PanelProps {
  layoutType: LayoutType
  config: any
  gameData: GameData
  gameHandlers: GameHandlers
}