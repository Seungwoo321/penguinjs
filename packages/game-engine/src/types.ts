export interface GameStage {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  concept: string
  initialCode: string
  solution: string
  testCases: TestCase[]
  hints: string[]
  explanation: string
}

export interface TestCase {
  id: string
  input: unknown
  expectedOutput: unknown
  description: string
  hidden?: boolean
}

export interface GameProgress {
  gameId: string
  completedStages: string[]
  currentStage: string
  totalScore: number
  achievements: Achievement[]
  lastPlayedAt: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
}

export interface CodeExecutionResult {
  success: boolean
  output: unknown
  error?: string
  executionTime: number
}

export interface GameState {
  currentGame: string | null
  currentStage: string | null
  userCode: string
  isExecuting: boolean
  executionResult: CodeExecutionResult | null
  progress: Record<string, GameProgress>
}