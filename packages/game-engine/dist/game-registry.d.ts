import { GameStage } from './types';
export interface GameMetadata {
    id: string;
    title: string;
    description: string;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    concepts: string[];
    order: number;
}
export interface Game {
    metadata: GameMetadata;
    stages: GameStage[];
}
declare class GameRegistry {
    private static instance;
    private games;
    private constructor();
    static getInstance(): GameRegistry;
    registerGame(game: Game): void;
    getGame(id: string): Game | undefined;
    getAllGames(): Game[];
    getGamesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Game[];
    getGameStages(gameId: string): GameStage[];
    getGameStage(gameId: string, stageId: string): GameStage | undefined;
}
export declare const gameRegistry: GameRegistry;
export {};
//# sourceMappingURL=game-registry.d.ts.map