/**
 * 공통 게임 아키텍처 타입 정의
 * 모든 JS 개념 게임에서 사용할 수 있는 확장 가능한 구조
 */

export type GameDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface GameStagePosition {
  row: number
  col: number
}

export interface GameCharacter {
  startPosition: GameStagePosition
  targetPosition: GameStagePosition
}

export interface GameItem {
  id: string
  position: GameStagePosition
  value: string
  locked?: boolean
  type?: string
}

export interface GameObstacle {
  type: string
  position: GameStagePosition
  properties?: Record<string, any>
}

export interface GameGrid {
  rows: number
  cols: number
}

export interface GameBoard {
  character: GameCharacter
  items: GameItem[]
  obstacles?: GameObstacle[]
  grid: GameGrid
}

export interface GameLevel {
  id: string
  difficulty: GameDifficulty
  stageNumber: number // 1-5 for each difficulty
  title: string
  description: string
  objective: string
  gameBoard: GameBoard
  codeTemplate: string
  solutionValidator: (code: string, result: any) => boolean
  hints: string[]
  explanation: string
  unlockConditions?: {
    requiredCompletedLevels?: string[]
    minimumScore?: number
  }
}

export interface GameProgress {
  gameId: string
  difficulty: GameDifficulty
  completedStages: Set<number>
  currentStage: number
  scores: Record<number, number>
  totalScore: number
  isUnlocked: boolean
}

export interface GameSession {
  gameId: string
  difficulty: GameDifficulty
  stage: number
  attempts: number
  hintsUsed: number
  startTime: number
  isCompleted: boolean
}

export interface GameConfig {
  id: string
  name?: string
  title?: string
  koreanTitle?: string
  description?: string
  koreanDescription?: string
  icon: string
  difficulty?: GameDifficulty[]
  difficulties?: GameDifficulty[]
  concepts?: string[]
  stagesPerDifficulty?: number
  totalStagesPerDifficulty?: number
  requiredScore?: number
  unlockRequirements?: {
    [key in GameDifficulty]?: {
      requiredCompletedGames?: string[]
      requiredDifficulty?: GameDifficulty
    }
  }
}

export interface GameValidationResult {
  success: boolean
  message: string
  characterPath?: GameStagePosition[]
  collectedItems?: string[]
  score?: number
  hint?: string
}

// 스테이지 범위 관련 타입
export interface StageRange {
  min: number
  max: number
}

export type DifficultyStageRanges = Record<GameDifficulty, StageRange>