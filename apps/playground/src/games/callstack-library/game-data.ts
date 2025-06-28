import { Game } from '@penguinjs/game-engine'
import { beginnerLevels } from './levels/beginner-levels'
import { intermediateLevels } from './levels/intermediate-levels' 
import { advancedLevels } from './levels/advanced-levels'

// 모든 레벨을 통합
const allLevels = [
  ...beginnerLevels,
  ...intermediateLevels,
  ...advancedLevels
]

// CallStack 레벨을 GameStage 형식으로 변환
const callstackStages = allLevels.map((level) => ({
  id: level.id,
  title: level.title,
  description: level.description,
  difficulty: level.difficulty,
  concept: 'callstack',
  initialCode: level.code,
  solution: '', // 실행 순서로 검증
  testCases: [
    {
      id: `${level.id}-tc1`,
      input: undefined,
      expectedOutput: level.expectedOrder,
      description: level.explanation
    }
  ],
  hints: level.hints,
  explanation: level.explanation
}))

export const callstackLibraryGame: Game = {
  metadata: {
    id: 'callstack-library',
    title: '콜스택 도서관',
    description: '함수 호출 스택과 실행 순서를 시각적으로 이해하세요',
    icon: '📚',
    difficulty: 'beginner',
    concepts: ['callstack', 'execution-context', 'recursion'],
    order: 2
  },
  stages: callstackStages
}