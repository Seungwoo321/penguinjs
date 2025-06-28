import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useGameStore = create(persist((set, get) => ({
    currentGame: null,
    currentStage: null,
    userCode: '',
    isExecuting: false,
    executionResult: null,
    progress: {},
    setCurrentGame: (gameId) => set({ currentGame: gameId }),
    setCurrentStage: (stageId) => set({ currentStage: stageId }),
    setUserCode: (code) => set({ userCode: code }),
    setExecuting: (isExecuting) => set({ isExecuting }),
    setExecutionResult: (result) => set({ executionResult: result }),
    completeStage: (gameId, stageId, score) => {
        const state = get();
        const currentProgress = state.progress[gameId] || {
            gameId,
            completedStages: [],
            currentStage: stageId,
            totalScore: 0,
            achievements: [],
            lastPlayedAt: new Date()
        };
        const updatedProgress = Object.assign(Object.assign({}, currentProgress), { completedStages: [...new Set([...currentProgress.completedStages, stageId])], totalScore: currentProgress.totalScore + score, lastPlayedAt: new Date() });
        set({
            progress: Object.assign(Object.assign({}, state.progress), { [gameId]: updatedProgress })
        });
    },
    resetGame: () => set({
        currentGame: null,
        currentStage: null,
        userCode: '',
        isExecuting: false,
        executionResult: null
    }),
    getGameProgress: (gameId) => get().progress[gameId]
}), {
    name: 'penguinjs-game-storage',
}));
//# sourceMappingURL=store.js.map