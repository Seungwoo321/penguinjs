export interface Score {
  points: number
  stars: 1 | 2 | 3
  timeBonus: number
  hintsUsed: number
  attempts: number
}

export interface GameAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export class ScoringSystem {
  private static PERFECT_SCORE = 100
  private static TIME_BONUS_MAX = 20
  private static HINT_PENALTY = 10
  private static ATTEMPT_PENALTY = 5

  static calculateScore(
    passed: boolean,
    executionTime: number,
    hintsUsed: number,
    attempts: number,
    maxTime: number = 60000 // 60 seconds default
  ): Score {
    if (!passed) {
      return {
        points: 0,
        stars: 1,
        timeBonus: 0,
        hintsUsed,
        attempts
      }
    }

    // Base score
    let points = this.PERFECT_SCORE

    // Time bonus (faster = more points)
    const timeRatio = Math.max(0, 1 - (executionTime / maxTime))
    const timeBonus = Math.floor(timeRatio * this.TIME_BONUS_MAX)
    points += timeBonus

    // Penalties
    points -= hintsUsed * this.HINT_PENALTY
    points -= (attempts - 1) * this.ATTEMPT_PENALTY

    // Ensure minimum score
    points = Math.max(points, 50)

    // Calculate stars
    let stars: 1 | 2 | 3 = 1
    if (points >= 90) stars = 3
    else if (points >= 70) stars = 2

    return {
      points,
      stars,
      timeBonus,
      hintsUsed,
      attempts
    }
  }

  static getStarEmoji(stars: number): string {
    switch (stars) {
      case 3: return '⭐⭐⭐'
      case 2: return '⭐⭐'
      default: return '⭐'
    }
  }
}

export class AchievementSystem {
  private achievements: Map<string, GameAchievement> = new Map()

  constructor() {
    this.initializeAchievements()
  }

  private initializeAchievements() {
    const achievementList: GameAchievement[] = [
      {
        id: 'first-closure',
        name: '클로저 입문자',
        description: '첫 번째 클로저를 성공적으로 만들었습니다',
        icon: '🎯',
        unlocked: false
      },
      {
        id: 'perfect-score',
        name: '완벽주의자',
        description: '힌트 없이 첫 시도에 문제를 해결했습니다',
        icon: '💎',
        unlocked: false
      },
      {
        id: 'speed-demon',
        name: '스피드 데몬',
        description: '30초 이내에 문제를 해결했습니다',
        icon: '⚡',
        unlocked: false
      },
      {
        id: 'closure-master',
        name: '클로저 마스터',
        description: '클로저 동굴의 모든 스테이지를 완료했습니다',
        icon: '👑',
        unlocked: false
      },
      {
        id: 'memory-efficient',
        name: '메모리 효율왕',
        description: '메모리 관리 스테이지를 완벽하게 해결했습니다',
        icon: '🧠',
        unlocked: false
      }
    ]

    achievementList.forEach(achievement => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  checkAndUnlockAchievements(
    gameId: string,
    stageId: string,
    score: Score,
    executionTime: number
  ): GameAchievement[] {
    const unlockedAchievements: GameAchievement[] = []

    // First closure achievement
    if (gameId === 'closure-cave' && stageId === 'cc-1' && score.points > 0) {
      const achievement = this.unlockAchievement('first-closure')
      if (achievement) unlockedAchievements.push(achievement)
    }

    // Perfect score achievement
    if (score.hintsUsed === 0 && score.attempts === 1 && score.points >= 100) {
      const achievement = this.unlockAchievement('perfect-score')
      if (achievement) unlockedAchievements.push(achievement)
    }

    // Speed demon achievement
    if (executionTime < 30000 && score.points > 0) {
      const achievement = this.unlockAchievement('speed-demon')
      if (achievement) unlockedAchievements.push(achievement)
    }

    // Memory efficient achievement
    if (gameId === 'closure-cave' && stageId === 'cc-5' && score.stars === 3) {
      const achievement = this.unlockAchievement('memory-efficient')
      if (achievement) unlockedAchievements.push(achievement)
    }

    return unlockedAchievements
  }

  private unlockAchievement(id: string): GameAchievement | null {
    const achievement = this.achievements.get(id)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = new Date()
      return achievement
    }
    return null
  }

  getAchievements(): GameAchievement[] {
    return Array.from(this.achievements.values())
  }

  getUnlockedAchievements(): GameAchievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked)
  }
}