/**
 * CallStack Library 게임 타입 정의
 * 중앙화된 타입 시스템으로 구조적 일관성 확보
 */

// 기본 타입
export type QueueType = 'callstack' | 'microtask' | 'macrotask' | 'animation' | 'generator' | 'io' | 'worker';
export type GameState = 'idle' | 'playing' | 'paused' | 'completed' | 'error';
export type LayoutType = 'A' | 'A+' | 'B' | 'C' | 'D' | 'E';
export type EvaluationType = 'functionOrder' | 'executionCount' | 'snapshot' | 'queueStates';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// 큐 아이템
export interface QueueItem {
  id: string;
  functionName: string;
  color?: string;
  height?: number;
  queueType?: QueueType;
  timestamp?: number;
  position?: number;
  delay?: number; // setTimeout/setInterval delay
  metadata?: {
    description?: string;
    code?: string;
    lineNumber?: number;
    [key: string]: any;
  };
}

// 실행 단계
export interface ExecutionStep {
  id: string;
  type: 'push' | 'pop' | 'execute' | 'queue' | 'dequeue';
  queueType: QueueType;
  functionName: string;
  description?: string;
  timestamp: number;
  codeHighlight?: {
    start: number;
    end: number;
  };
  expectedState?: QueueStates;
}

// 큐 상태
export interface QueueStates {
  callstack: QueueItem[];
  microtask: QueueItem[];
  macrotask: QueueItem[];
  step?: number;
  timestamp?: number;
}

// 검증 결과
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  score?: number;
  hint?: string;
  details?: {
    queueType?: QueueType;
    expected?: any;
    actual?: any;
    message?: string;
  }[];
}

// 게임 설정
export interface GameConfig {
  maxCallStackSize: number;
  maxQueueSize: number;
  executionSpeed: number;
  enableAutoplay: boolean;
  enableHints: boolean;
  enableSolution: boolean;
  enableSound?: boolean;
  enableAnimations?: boolean;
  accessibility?: {
    enableKeyboardShortcuts: boolean;
    enableScreenReaderAnnouncements: boolean;
    highContrastMode: boolean;
    reducedMotion: boolean;
  };
}

// 스테이지 정보
export interface StageInfo {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  layoutType: LayoutType;
  concepts: string[];
  objectives: string[];
  code: string;
  solution?: any;
  hints?: string[];
  maxScore: number;
  unlockCondition?: {
    stage?: number;
    minScore?: number;
  };
}

// 사용자 진행 상황
export interface UserProgress {
  userId: string;
  currentStage: number;
  completedStages: number[];
  stageScores: Record<number, number>;
  totalScore: number;
  hintsUsed: Record<number, number>;
  achievements: Achievement[];
  statistics: GameStatistics;
}

// 업적 시스템
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  reward?: {
    type: 'badge' | 'theme' | 'hint';
    value: any;
  };
}

// 게임 통계
export interface GameStatistics {
  totalPlayTime: number;
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageHintsPerStage: number;
  favoriteStage?: number;
  longestStreak: number;
  currentStreak: number;
}

// 힌트 시스템
export interface Hint {
  id: string;
  type: 'concept' | 'step' | 'solution';
  content: string;
  cost?: number; // 점수 차감
  unlockCondition?: {
    attempts?: number;
    timeElapsed?: number;
  };
}

// 평가 시스템
export interface Evaluation {
  evaluationType: EvaluationType;
  criteria: {
    functionOrder?: string[];
    executionCount?: number;
    queueSnapshots?: Record<number, QueueStates>;
    finalState?: QueueStates;
  };
  scoring: {
    maxScore: number;
    deductions: {
      wrongOrder?: number;
      extraSteps?: number;
      missingSteps?: number;
      incorrectState?: number;
      hintUsed?: number;
    };
  };
}

// 함수 정보
export interface FunctionInfo {
  name: string;
  category: 'sync' | 'async' | 'promise' | 'callback';
  queueType: QueueType;
  description: string;
  example?: string;
  color?: string;
  icon?: string;
  relatedConcepts?: string[];
}

// 애니메이션 설정
export interface AnimationConfig {
  duration: {
    queueTransition: number;
    itemMove: number;
    highlight: number;
    execution: number;
  };
  easing: string;
  stagger: number;
}

// 테마 설정
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'colorblind' | 'highContrast';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  sounds: boolean;
}

// 레이아웃 props 타입들
export interface BaseLayoutProps {
  gameData: any;
  gameHandlers: any;
  className?: string;
}

export interface VisualizationPanelProps {
  currentStack: QueueItem[];
  maxSize?: number;
  isExecuting?: boolean;
  highlightedIndex?: number;
  onItemClick?: (item: QueueItem, index: number) => void;
  className?: string;
}

export interface MultiQueueVisualizationPanelProps {
  queueStates: QueueStates;
  isExecuting?: boolean;
  highlightedQueue?: QueueType | null;
  onQueueItemClick?: (queueType: QueueType, item: QueueItem) => void;
  maxSize?: number;
  className?: string;
}

export interface SnapshotBuilderPanelProps {
  executionSteps: ExecutionStep[];
  currentStep: number;
  onSnapshotChange: (step: number, snapshot: QueueItem[]) => void;
  className?: string;
}

export interface QueueSnapshotBuilderPanelProps {
  executionSteps: ExecutionStep[];
  currentStep: number;
  queueStates: Record<number, QueueStates>;
  onQueueStateChange: (step: number, state: QueueStates) => void;
  onValidateQueueStep?: (step: number) => ValidationResult;
  validationResults?: Record<number, ValidationResult>;
  availableFunctions?: FunctionInfo[];
  className?: string;
}

export interface FunctionSelectorPanelProps {
  functions: FunctionInfo[];
  playMode: 'drag' | 'sequence';
  selectedFunctions?: string[];
  onFunctionSelect?: (functionName: string) => void;
  onReorder?: (functions: string[]) => void;
  onRemove?: (functionName: string) => void;
  className?: string;
}

export interface EvaluationProps {
  layoutType: LayoutType;
  evaluation: Evaluation;
  userAnswer: any;
  onSubmit: () => void | Promise<void>;
  onHint?: () => void;
  onSimulate?: () => void;
  onReset?: () => void;
  expectedCount?: number;
  snapshotCheckpoints?: Record<number, boolean>;
  validationResults?: ValidationResult;
  className?: string;
}

export interface HintPanelProps {
  hints: Hint[];
  showHints: boolean;
  hintsUsed: number;
  onRequestHint?: () => void;
  className?: string;
}

// 레이아웃 렌더러 props
export interface LayoutRendererProps {
  layoutType: LayoutType;
  gameData: any;
  gameHandlers: any;
  className?: string;
}

export interface RightPanelProps {
  layoutType: LayoutType;
  config: any;
  gameData: any;
  gameHandlers: any;
  className?: string;
}

// 이벤트 타입들
export interface GameEvent {
  type: 'game_start' | 'game_complete' | 'stage_complete' | 'hint_used' | 'answer_submit';
  timestamp: Date;
  data?: any;
}

export interface QueueEvent {
  type: 'item_added' | 'item_removed' | 'queue_cleared' | 'queue_executed';
  queueType: QueueType;
  item?: QueueItem;
  timestamp: Date;
}

// 유틸리티 타입들
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

// Re-export layout types
export * from './layout';