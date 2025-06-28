/**
 * 게임 팩토리 - 다른 게임들을 쉽게 구현할 수 있도록 도와주는 유틸리티
 */

import { GameConfig, GameLevel, GameDifficulty } from './types'

export interface GameTemplate {
  id: string
  name: string
  description: string
  icon: string
  concept: string // 학습할 JavaScript 개념
  levels: {
    beginner: GameLevel[]
    intermediate: GameLevel[]
    advanced: GameLevel[]
  }
}

export class GameFactory {
  static createGameConfig(template: GameTemplate): GameConfig {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      difficulties: ['beginner', 'intermediate', 'advanced'],
      totalStagesPerDifficulty: 5,
      unlockRequirements: {
        beginner: {},
        intermediate: { requiredDifficulty: 'beginner' },
        advanced: { requiredDifficulty: 'intermediate' }
      }
    }
  }

  // 게임 레벨 템플릿 생성 도우미
  static createLevelTemplate(
    gameId: string,
    difficulty: GameDifficulty,
    stageNumber: number,
    levelData: {
      title: string
      description: string
      objective: string
      codeTemplate: string
      hints: string[]
      explanation: string
      gridSize?: { rows: number; cols: number }
      characterStart?: { row: number; col: number }
      characterTarget?: { row: number; col: number }
      items?: Array<{ id: string; position: { row: number; col: number }; value: string; locked?: boolean }>
      obstacles?: Array<{ type: string; position: { row: number; col: number } }>
      solutionValidator: (code: string, result: any) => boolean
    }
  ): GameLevel {
    const defaultGrid = { rows: 5, cols: 5 }
    const defaultStart = { row: 4, col: 0 }
    const defaultTarget = { row: 0, col: 4 }

    return {
      id: `${gameId}-${difficulty}-${stageNumber}`,
      difficulty,
      stageNumber,
      title: levelData.title,
      description: levelData.description,
      objective: levelData.objective,
      gameBoard: {
        character: {
          startPosition: levelData.characterStart || defaultStart,
          targetPosition: levelData.characterTarget || defaultTarget
        },
        items: levelData.items || [],
        obstacles: levelData.obstacles || [],
        grid: levelData.gridSize || defaultGrid
      },
      codeTemplate: levelData.codeTemplate,
      solutionValidator: levelData.solutionValidator,
      hints: levelData.hints,
      explanation: levelData.explanation,
      unlockConditions: {
        requiredCompletedLevels: stageNumber > 1 ? [`${gameId}-${difficulty}-${stageNumber - 1}`] : undefined
      }
    }
  }

  // 다른 게임들을 위한 기본 검증자들
  static validators = {
    // 함수 반환값 검증
    functionReturns: (expectedValue: any) => (code: string, result: any) => {
      try {
        if (typeof result === 'function') {
          return result() === expectedValue
        }
        return result === expectedValue
      } catch {
        return false
      }
    },

    // 배열 순서 검증
    arrayOrder: (expectedArray: any[]) => (code: string, result: any) => {
      try {
        if (Array.isArray(result) && Array.isArray(expectedArray)) {
          return JSON.stringify(result) === JSON.stringify(expectedArray)
        }
        return false
      } catch {
        return false
      }
    },

    // 객체 구조 검증
    objectStructure: (expectedKeys: string[]) => (code: string, result: any) => {
      try {
        if (typeof result === 'object' && result !== null) {
          const resultKeys = Object.keys(result).sort()
          const expected = expectedKeys.sort()
          return JSON.stringify(resultKeys) === JSON.stringify(expected)
        }
        return false
      } catch {
        return false
      }
    },

    // 타입 검증
    typeCheck: (expectedType: string) => (code: string, result: any) => {
      return typeof result === expectedType
    },

    // 커스텀 검증
    custom: (validator: (code: string, result: any) => boolean) => validator
  }

  // 공통 힌트 템플릿
  static hintTemplates = {
    functionBasic: [
      '함수를 선언하고 값을 반환해보세요',
      'return 키워드를 사용하세요',
      'function 키워드로 함수를 만들 수 있습니다'
    ],
    
    closure: [
      '외부 함수의 변수를 내부 함수에서 사용해보세요',
      '함수를 반환하는 함수를 만들어보세요',
      '클로저는 함수가 선언될 때의 환경을 기억합니다'
    ],

    async: [
      'async/await 키워드를 사용해보세요',
      'Promise를 반환하는 함수를 만들어보세요',
      '비동기 함수는 Promise를 반환합니다'
    ],

    array: [
      '배열 메서드를 활용해보세요',
      'map, filter, reduce 등을 사용할 수 있습니다',
      '배열의 각 요소에 함수를 적용해보세요'
    ]
  }

  // 게임 아이템 템플릿
  static itemTemplates = {
    treasure: (id: string, position: { row: number; col: number }, emoji: string) => ({
      id,
      position,
      value: emoji,
      locked: false
    }),

    lockedTreasure: (id: string, position: { row: number; col: number }, emoji: string) => ({
      id,
      position,
      value: emoji,
      locked: true
    }),

    collectible: (id: string, position: { row: number; col: number }, emoji: string, type?: string) => ({
      id,
      position,
      value: emoji,
      type,
      locked: false
    })
  }

  // 장애물 템플릿
  static obstacleTemplates = {
    rock: (position: { row: number; col: number }) => ({
      type: 'rock' as const,
      position
    }),

    water: (position: { row: number; col: number }) => ({
      type: 'water' as const,
      position
    }),

    ice: (position: { row: number; col: number }) => ({
      type: 'ice' as const,
      position
    })
  }
}