import { gameRegistry } from '@penguinjs/game-engine'
import { closureCaveGame } from '@/games/closure-cave'
import { promisePlanetGame } from '@/games/promise-planet'
import { callstackLibraryGame } from '@/games/callstack-library'

// 게임 레지스트리 초기화 (한 번만 실행)
let initialized = false

export function initializeGames() {
  if (initialized) return
  
  gameRegistry.registerGame(closureCaveGame)
  gameRegistry.registerGame(promisePlanetGame)
  gameRegistry.registerGame(callstackLibraryGame)
  
  initialized = true
}

// 모든 컴포넌트에서 사용할 수 있도록 export
export { gameRegistry }