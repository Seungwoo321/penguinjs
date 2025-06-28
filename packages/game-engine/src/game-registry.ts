import { GameStage } from './types'

export interface GameMetadata {
  id: string
  title: string
  description: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  concepts: string[]
  order: number
}

export interface Game {
  metadata: GameMetadata
  stages: GameStage[]
}

class GameRegistry {
  private static instance: GameRegistry
  private games: Map<string, Game> = new Map()

  private constructor() {}

  static getInstance(): GameRegistry {
    if (!GameRegistry.instance) {
      GameRegistry.instance = new GameRegistry()
    }
    return GameRegistry.instance
  }

  registerGame(game: Game): void {
    if (this.games.has(game.metadata.id)) {
      console.warn(`Game with id ${game.metadata.id} already registered`)
    }
    this.games.set(game.metadata.id, game)
  }

  getGame(id: string): Game | undefined {
    return this.games.get(id)
  }

  getAllGames(): Game[] {
    return Array.from(this.games.values()).sort((a, b) => a.metadata.order - b.metadata.order)
  }

  getGamesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Game[] {
    return this.getAllGames().filter(game => game.metadata.difficulty === difficulty)
  }

  getGameStages(gameId: string): GameStage[] {
    const game = this.games.get(gameId)
    return game ? game.stages : []
  }

  getGameStage(gameId: string, stageId: string): GameStage | undefined {
    const stages = this.getGameStages(gameId)
    return stages.find(stage => stage.id === stageId)
  }
}

export const gameRegistry = GameRegistry.getInstance()