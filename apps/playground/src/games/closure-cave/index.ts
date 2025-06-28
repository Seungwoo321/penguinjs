import { Game, GameStage } from '@penguinjs/game-engine'
import { closureLevels } from './game-engine'

// 게임 엔진의 레벨을 GameStage 형식으로 변환
const closureCaveStages: GameStage[] = closureLevels.map((level, index) => ({
  id: level.id,
  title: level.title,
  description: level.description,
  difficulty: index < 2 ? 'beginner' : index < 4 ? 'intermediate' : 'advanced',
  concept: 'closure',
  initialCode: level.codeTemplate,
  solution: '', // 솔루션은 validator로 처리
  testCases: [
    {
      id: 'tc-1',
      input: undefined,
      expectedOutput: true,
      description: level.objective
    }
  ],
  hints: level.hints,
  explanation: level.explanation
}))

export const closureCaveGame: Game = {
  metadata: {
    id: 'closure-cave',
    title: '클로저 동굴',
    description: '클로저의 신비로운 세계를 탐험하며 스코프와 환경을 이해해보세요.',
    icon: '🕳️',
    difficulty: 'beginner',
    concepts: ['closure', 'scope', 'lexical-environment'],
    order: 1
  },
  stages: closureCaveStages
}

// 실제 게임 컴포넌트 export
export { EnhancedClosureCaveGame as ClosureCaveGame } from './EnhancedClosureCaveGame'