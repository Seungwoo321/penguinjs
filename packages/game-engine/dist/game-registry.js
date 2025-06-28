class GameRegistry {
    constructor() {
        this.games = new Map();
    }
    static getInstance() {
        if (!GameRegistry.instance) {
            GameRegistry.instance = new GameRegistry();
        }
        return GameRegistry.instance;
    }
    registerGame(game) {
        if (this.games.has(game.metadata.id)) {
            console.warn(`Game with id ${game.metadata.id} already registered`);
        }
        this.games.set(game.metadata.id, game);
    }
    getGame(id) {
        return this.games.get(id);
    }
    getAllGames() {
        return Array.from(this.games.values()).sort((a, b) => a.metadata.order - b.metadata.order);
    }
    getGamesByDifficulty(difficulty) {
        return this.getAllGames().filter(game => game.metadata.difficulty === difficulty);
    }
    getGameStages(gameId) {
        const game = this.games.get(gameId);
        return game ? game.stages : [];
    }
    getGameStage(gameId, stageId) {
        const stages = this.getGameStages(gameId);
        return stages.find(stage => stage.id === stageId);
    }
}
export const gameRegistry = GameRegistry.getInstance();
//# sourceMappingURL=game-registry.js.map