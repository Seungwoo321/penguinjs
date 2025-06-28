import { Game } from '@penguinjs/game-engine'
import { promisePlanetStages } from './stages'

export const promisePlanetGame: Game = {
  metadata: {
    id: 'promise-planet',
    title: '프로미스 행성',
    description: '비동기 프로그래밍의 우주에서 Promise와 콜백을 마스터하세요.',
    icon: '🪐',
    difficulty: 'intermediate',
    concepts: ['promise', 'async', 'callback'],
    order: 2
  },
  stages: promisePlanetStages
}