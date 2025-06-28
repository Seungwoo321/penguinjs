import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GameState, GameProgress, CodeExecutionResult } from './types'

interface GameStore extends GameState {
  setCurrentGame: (gameId: string) => void
  setCurrentStage: (stageId: string) => void
  setUserCode: (code: string) => void
  setExecuting: (isExecuting: boolean) => void
  setExecutionResult: (result: CodeExecutionResult | null) => void
  completeStage: (gameId: string, stageId: string, score: number) => void
  resetGame: () => void
  getGameProgress: (gameId: string) => GameProgress | undefined
}

export const useGameStore = create<GameStore>(
  persist(
    (set, get) => ({
      currentGame: null,
      currentStage: null,
      userCode: '',
      isExecuting: false,
      executionResult: null,
      progress: {},

      setCurrentGame: (gameId: string) => set({ currentGame: gameId }),
      
      setCurrentStage: (stageId: string) => set({ currentStage: stageId }),
      
      setUserCode: (code: string) => set({ userCode: code }),
      
      setExecuting: (isExecuting: boolean) => set({ isExecuting }),
      
      setExecutionResult: (result: CodeExecutionResult | null) => set({ executionResult: result }),
      
      completeStage: (gameId: string, stageId: string, score: number) => {
        const state = get() as GameStore
        const currentProgress = state.progress[gameId] || {
          gameId,
          completedStages: [],
          currentStage: stageId,
          totalScore: 0,
          achievements: [],
          lastPlayedAt: new Date()
        }

        const updatedProgress = {
          ...currentProgress,
          completedStages: [...new Set([...currentProgress.completedStages, stageId])],
          totalScore: currentProgress.totalScore + score,
          lastPlayedAt: new Date()
        }

        set({
          progress: {
            ...state.progress,
            [gameId]: updatedProgress
          }
        })
      },

      resetGame: () => set({
        currentGame: null,
        currentStage: null,
        userCode: '',
        isExecuting: false,
        executionResult: null
      }),

      getGameProgress: (gameId: string) => (get() as GameStore).progress[gameId]
    }),
    {
      name: 'penguinjs-game-storage',
    }
  ) as any
)