import { GameConfig, GameDifficulty, GameValidationResult } from './types'

export abstract class BaseGameEngine<TLevel> {
  protected levels: Map<GameDifficulty, TLevel[]> = new Map()
  protected config: GameConfig

  constructor(config: GameConfig) {
    this.config = config
  }

  // 추상 메서드 - 하위 클래스에서 구현
  protected abstract loadAllLevels(): void
  abstract validateAnswer(level: TLevel, answer: any): GameValidationResult

  // 레벨 추가
  protected addLevels(difficulty: GameDifficulty, levels: TLevel[]): void {
    this.levels.set(difficulty, levels)
  }

  // 레벨 가져오기
  getLevelByStage(difficulty: GameDifficulty, stage: number): TLevel | null {
    console.log('🔍 BaseGameEngine.getLevelByStage called:', { difficulty, stage })
    
    const difficultyLevels = this.levels.get(difficulty)
    console.log('📋 Difficulty levels found:', difficultyLevels ? difficultyLevels.length : 0, 'levels')
    
    if (!difficultyLevels) {
      console.log('❌ No levels found for difficulty:', difficulty)
      return null
    }
    
    const level = difficultyLevels.find((l: any) => l.stageNumber === stage)
    console.log('🎯 Level search result:', { 
      searchingFor: stage, 
      found: level ? (level as any).stageNumber : 'none',
      levelId: level ? (level as any).id : 'none'
    })
    
    if (!level) {
      console.error(`❌ No level found for ${difficulty} stage ${stage}. Available stages:`, 
        difficultyLevels.map(l => (l as any).stageNumber))
      return null
    }
    
    // 추가 검증: 레벨의 difficulty 속성과 요청된 difficulty 일치 확인
    if ((level as any).difficulty !== difficulty) {
      console.error(`❌ Level difficulty mismatch: requested ${difficulty}, found ${(level as any).difficulty}`)
      return null
    }
    
    console.log('✅ Level validation passed')
    return level
  }

  // 총 스테이지 수
  getTotalStages(difficulty: GameDifficulty): number {
    const difficultyLevels = this.levels.get(difficulty)
    return difficultyLevels?.length || 0
  }

  // 게임 설정 반환
  getGameConfig(): GameConfig {
    return this.config
  }

  // 모든 레벨 반환
  getAllLevels(difficulty: GameDifficulty): TLevel[] {
    return this.levels.get(difficulty) || []
  }
}