import { GameState, GameProgress, CodeExecutionResult } from './types';
interface GameStore extends GameState {
    setCurrentGame: (gameId: string) => void;
    setCurrentStage: (stageId: string) => void;
    setUserCode: (code: string) => void;
    setExecuting: (isExecuting: boolean) => void;
    setExecutionResult: (result: CodeExecutionResult | null) => void;
    completeStage: (gameId: string, stageId: string, score: number) => void;
    resetGame: () => void;
    getGameProgress: (gameId: string) => GameProgress | undefined;
}
export declare const useGameStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GameStore>>;
export {};
//# sourceMappingURL=store.d.ts.map