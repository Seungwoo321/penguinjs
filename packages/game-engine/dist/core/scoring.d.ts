export interface Score {
    points: number;
    stars: 1 | 2 | 3;
    timeBonus: number;
    hintsUsed: number;
    attempts: number;
}
export interface GameAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: Date;
}
export declare class ScoringSystem {
    private static PERFECT_SCORE;
    private static TIME_BONUS_MAX;
    private static HINT_PENALTY;
    private static ATTEMPT_PENALTY;
    static calculateScore(passed: boolean, executionTime: number, hintsUsed: number, attempts: number, maxTime?: number): Score;
    static getStarEmoji(stars: number): string;
}
export declare class AchievementSystem {
    private achievements;
    constructor();
    private initializeAchievements;
    checkAndUnlockAchievements(gameId: string, stageId: string, score: Score, executionTime: number): GameAchievement[];
    private unlockAchievement;
    getAchievements(): GameAchievement[];
    getUnlockedAchievements(): GameAchievement[];
}
//# sourceMappingURL=scoring.d.ts.map