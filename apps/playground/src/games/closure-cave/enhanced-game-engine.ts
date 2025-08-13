/**
 * 향상된 클로저 동굴 게임 엔진
 * 15단계 + 난이도별 구분 + 확장 가능한 아키텍처
 */

import { GameLevel, GameDifficulty, GameValidationResult, GameStagePosition } from '@/games/shared/types'
import { allClosureLevels } from '@/games/closure-cave/levels'

export class ClosureCaveEngine {
  private levels: Map<string, GameLevel> = new Map()

  constructor() {
    this.initializeLevels()
  }

  private initializeLevels(): void {
    // 모든 난이도의 레벨을 맵에 등록
    Object.values(allClosureLevels).flat().forEach(level => {
      this.levels.set(level.id, level)
    })
  }

  // 난이도별 레벨 목록 반환
  getLevelsByDifficulty(difficulty: GameDifficulty): GameLevel[] {
    return allClosureLevels[difficulty] || []
  }

  // 특정 레벨 반환
  getLevel(levelId: string): GameLevel | undefined {
    return this.levels.get(levelId)
  }

  // 난이도와 스테이지 번호로 레벨 반환
  getLevelByStage(difficulty: GameDifficulty, stageNumber: number): GameLevel | undefined {
    const levels = this.getLevelsByDifficulty(difficulty)
    const foundLevel = levels.find(level => level.stageNumber === stageNumber)
    return foundLevel
  }

  // 코드 검증 및 게임 로직 실행
  validateSolution(level: GameLevel, userCode: string): GameValidationResult {
    try {
      // 코드 실행 환경 준비
      const func = new Function('return ' + userCode)
      const result = func()

      // 레벨별 검증 함수 실행
      const isValid = level.solutionValidator(userCode, result)

      if (isValid) {
        // 성공 시 펭귄 이동 경로 계산
        const characterPath = this.calculateCharacterPath(level)
        const collectedItems = this.getCollectedItems(level, characterPath)

        return {
          success: true,
          message: '성공! 펭귄이 보물을 찾았습니다! 🎉',
          characterPath,
          collectedItems,
          score: this.calculateScore(level, characterPath)
        }
      } else {
        return {
          success: false,
          message: '아직 올바르지 않습니다. 힌트를 확인해보세요! 🤔'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `코드 실행 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'} ❌`
      }
    }
  }

  // 펭귄 이동 경로 계산 (A* 알고리즘 단순화 버전)
  private calculateCharacterPath(level: GameLevel): GameStagePosition[] {
    const { character, grid, obstacles = [] } = level.gameBoard
    const path: GameStagePosition[] = []
    
    const start = character.startPosition
    const target = character.targetPosition

    // 단순한 경로 찾기 (실제로는 더 복잡한 알고리즘 사용 가능)
    let current = { ...start }
    path.push({ ...current })

    while (current.row !== target.row || current.col !== target.col) {
      // 목표 지점으로 이동
      if (current.row < target.row) current.row++
      else if (current.row > target.row) current.row--
      else if (current.col < target.col) current.col++
      else if (current.col > target.col) current.col--

      // 장애물 회피 로직 (간단한 버전)
      const hasObstacle = obstacles.some(obs => 
        obs.position.row === current.row && obs.position.col === current.col
      )
      
      if (hasObstacle) {
        // 장애물이 있으면 우회 경로 계산
        if (current.col < grid.cols - 1) current.col++
        else if (current.row < grid.rows - 1) current.row++
      }

      path.push({ ...current })

      // 무한 루프 방지
      if (path.length > grid.rows * grid.cols * 2) break
    }

    return path
  }

  // 경로상에서 수집할 수 있는 아이템 계산
  private getCollectedItems(level: GameLevel, path: GameStagePosition[]): string[] {
    const collected: string[] = []
    const { items } = level.gameBoard

    path.forEach(position => {
      items.forEach(item => {
        if (item.position.row === position.row && 
            item.position.col === position.col &&
            !item.locked &&
            !collected.includes(item.id)) {
          collected.push(item.id)
        }
      })
    })

    return collected
  }

  // 점수 계산
  private calculateScore(level: GameLevel, path: GameStagePosition[]): number {
    const baseScore = 100
    const pathEfficiencyBonus = Math.max(0, 50 - path.length * 2) // 짧은 경로에 보너스
    const difficultyMultiplier = this.getDifficultyMultiplier(level.difficulty)
    
    return Math.round((baseScore + pathEfficiencyBonus) * difficultyMultiplier)
  }

  private getDifficultyMultiplier(difficulty: GameDifficulty): number {
    switch (difficulty) {
      case 'beginner': return 1.0
      case 'intermediate': return 1.5
      case 'advanced': return 2.0
    }
  }

  // 난이도별 총 스테이지 수 반환
  getTotalStages(difficulty: GameDifficulty): number {
    return this.getLevelsByDifficulty(difficulty).length
  }

  // 게임 설정 정보 반환
  getGameConfig() {
    return {
      id: 'closure-cave',
      name: '클로저 동굴',
      description: '클로저의 비밀을 파헤치며 동굴 속 보물을 찾아보세요',
      icon: '🕳️',
      difficulties: ['beginner', 'intermediate', 'advanced'] as GameDifficulty[],
      totalStagesPerDifficulty: 5,
      unlockRequirements: {
        beginner: {},
        intermediate: { requiredDifficulty: 'beginner' as GameDifficulty },
        advanced: { requiredDifficulty: 'intermediate' as GameDifficulty }
      }
    }
  }

  // 레벨 검증 (개발/테스트용)
  validateAllLevels(): { valid: number; invalid: number; errors: string[] } {
    let valid = 0
    let invalid = 0
    const errors: string[] = []

    for (const [levelId, level] of Array.from(this.levels.entries())) {
      try {
        // 기본적인 레벨 구조 검증
        if (!level.id || !level.title || !level.codeTemplate) {
          errors.push(`${levelId}: 필수 필드 누락`)
          invalid++
          continue
        }

        // 게임 보드 검증
        const { character, grid, items } = level.gameBoard
        if (!character.startPosition || !character.targetPosition || !grid.rows || !grid.cols) {
          errors.push(`${levelId}: 게임 보드 설정 오류`)
          invalid++
          continue
        }

        valid++
      } catch (error) {
        errors.push(`${levelId}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        invalid++
      }
    }

    return { valid, invalid, errors }
  }
}