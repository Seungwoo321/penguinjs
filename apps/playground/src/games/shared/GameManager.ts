/**
 * 모든 JS 개념 게임을 관리하는 중앙 매니저
 * 진행 상황, 잠금 해제, 점수 관리 등을 담당
 */

import { GameConfig, GameProgress, GameSession, GameDifficulty, GameLevel } from './types'

export class GameManager {
  private static instance: GameManager
  private gameConfigs: Map<string, GameConfig> = new Map()
  private gameProgress: Map<string, GameProgress> = new Map()
  private currentSession: GameSession | null = null

  private constructor() {
    this.loadProgress()
  }

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager()
    }
    return GameManager.instance
  }

  // 게임 등록
  registerGame(config: GameConfig): void {
    this.gameConfigs.set(config.id, config)
    
    // 각 난이도별로 진행 상황 초기화
    config.difficulties.forEach(difficulty => {
      const progressKey = `${config.id}-${difficulty}`
      if (!this.gameProgress.has(progressKey)) {
        const isUnlocked = this.checkIfUnlocked(config.id, difficulty)
        // 난이도별 시작 스테이지 설정
        const startStage = difficulty === 'beginner' ? 1 : 
                         difficulty === 'intermediate' ? 9 : 17
        this.gameProgress.set(progressKey, {
          gameId: config.id,
          difficulty,
          completedStages: new Set(),
          currentStage: startStage,
          scores: {},
          totalScore: 0,
          isUnlocked
        })
      }
    })
  }

  // 난이도별 잠금 해제 여부 확인
  private checkIfUnlocked(gameId: string, difficulty: GameDifficulty): boolean {
    // 테스트를 위해 모든 난이도 잠금 해제
    return true
    
    // 원래 로직 (나중에 주석 해제)
    /*
    const config = this.gameConfigs.get(gameId)
    if (!config) return false

    // 초급은 항상 잠금 해제
    if (difficulty === 'beginner') return true

    const requirements = config.unlockRequirements[difficulty]
    if (!requirements) return true

    // 이전 난이도 완료 확인
    if (requirements.requiredDifficulty) {
      const prevDifficultyKey = `${gameId}-${requirements.requiredDifficulty}`
      const prevProgress = this.gameProgress.get(prevDifficultyKey)
      if (!prevProgress || prevProgress.completedStages.size < config.totalStagesPerDifficulty) {
        return false
      }
    }

    // 다른 게임 완료 확인
    if (requirements.requiredCompletedGames) {
      for (const requiredGameId of requirements.requiredCompletedGames) {
        const requiredProgress = this.gameProgress.get(`${requiredGameId}-beginner`)
        if (!requiredProgress || requiredProgress.completedStages.size < config.totalStagesPerDifficulty) {
          return false
        }
      }
    }

    return true
    */
  }

  // 게임 세션 시작
  startGameSession(gameId: string, difficulty: GameDifficulty, stage: number): GameSession {
    const progressKey = `${gameId}-${difficulty}`
    const progress = this.gameProgress.get(progressKey)
    
    if (!progress?.isUnlocked) {
      throw new Error(`Game ${gameId} difficulty ${difficulty} is locked`)
    }

    this.currentSession = {
      gameId,
      difficulty,
      stage,
      attempts: 0,
      hintsUsed: 0,
      startTime: Date.now(),
      isCompleted: false
    }

    return this.currentSession
  }

  // 스테이지 완료 처리
  completeStage(score: number): void {
    if (!this.currentSession) return

    const { gameId, difficulty, stage } = this.currentSession
    const progressKey = `${gameId}-${difficulty}`
    const progress = this.gameProgress.get(progressKey)
    
    if (progress) {
      progress.completedStages.add(stage)
      progress.scores[stage] = score
      progress.totalScore += score
      
      // 다음 스테이지로 진행
      const config = this.gameConfigs.get(gameId)
      if (config) {
        // 절대 스테이지를 상대 스테이지로 변환
        const startStage = difficulty === 'beginner' ? 1 : 
                          difficulty === 'intermediate' ? 9 : 17
        const relativeStage = stage - startStage + 1
        
        if (relativeStage < config.totalStagesPerDifficulty) {
          progress.currentStage = stage + 1
        }
      }

      // 난이도 완료 시 다음 난이도 잠금 해제
      if (progress.completedStages.size === config?.totalStagesPerDifficulty) {
        this.unlockNextDifficulty(gameId, difficulty)
      }

      this.saveProgress()
    }

    this.currentSession.isCompleted = true
  }

  // 다음 난이도 잠금 해제
  private unlockNextDifficulty(gameId: string, completedDifficulty: GameDifficulty): void {
    const config = this.gameConfigs.get(gameId)
    if (!config) return

    const difficultyOrder: GameDifficulty[] = ['beginner', 'intermediate', 'advanced']
    const currentIndex = difficultyOrder.indexOf(completedDifficulty)
    
    if (currentIndex < difficultyOrder.length - 1) {
      const nextDifficulty = difficultyOrder[currentIndex + 1]
      const nextProgressKey = `${gameId}-${nextDifficulty}`
      const nextProgress = this.gameProgress.get(nextProgressKey)
      
      if (nextProgress) {
        nextProgress.isUnlocked = true
      }
    }
  }

  // 현재 세션 정보 업데이트
  updateCurrentSession(updates: Partial<GameSession>): void {
    if (this.currentSession) {
      Object.assign(this.currentSession, updates)
    }
  }

  // 게터 메서드들
  getGameConfig(gameId: string): GameConfig | undefined {
    return this.gameConfigs.get(gameId)
  }

  getGameProgress(gameId: string, difficulty: GameDifficulty): GameProgress | undefined {
    return this.gameProgress.get(`${gameId}-${difficulty}`)
  }

  getCurrentSession(): GameSession | null {
    return this.currentSession
  }

  getAllGameProgress(): Map<string, GameProgress> {
    return new Map(this.gameProgress)
  }

  // 진행 상황 저장/로드
  private saveProgress(): void {
    if (typeof window === 'undefined') return // SSR 환경에서는 실행하지 않음
    
    const progressData = Array.from(this.gameProgress.entries()).map(([key, progress]) => [
      key,
      {
        ...progress,
        completedStages: Array.from(progress.completedStages)
      }
    ])
    localStorage.setItem('penguinjs-game-progress', JSON.stringify(progressData))
  }

  private loadProgress(): void {
    if (typeof window === 'undefined') return // SSR 환경에서는 실행하지 않음
    
    const saved = localStorage.getItem('penguinjs-game-progress')
    if (saved) {
      try {
        const progressData = JSON.parse(saved)
        progressData.forEach(([key, progress]: [string, any]) => {
          this.gameProgress.set(key, {
            ...progress,
            completedStages: new Set(progress.completedStages)
          })
        })
      } catch (error) {
        console.warn('Failed to load game progress:', error)
      }
    }
  }

  // 진행 상황 리셋 (개발/테스트용)
  resetProgress(): void {
    this.gameProgress.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('penguinjs-game-progress')
    }
    
    // 모든 게임 재등록하여 초기 상태로 복원
    const configs = Array.from(this.gameConfigs.values())
    this.gameConfigs.clear()
    configs.forEach(config => this.registerGame(config))
  }
}