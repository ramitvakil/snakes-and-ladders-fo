import type { Server } from 'socket.io';
import type {
  Player,
  MarketView,
  ConvictionLevel,
  BotDifficulty,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  TurnResult,
} from '@game/shared';
import { GameEngine, type GameState } from '../engine/GameEngine.js';
import { BotEngine } from '../bot/BotEngine.js';
import { MarketBroadcaster } from '../market/MarketBroadcaster.js';
import { prisma } from '../config/prisma.js';
import { createChildLogger } from '../config/logger.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

const log = createChildLogger('service:game-manager');

/**
 * GameManager is the top-level service that coordinates:
 * - Game lifecycle (create, join, start, turn, end)
 * - Bot AI scheduling
 * - State persistence to DB
 * - Socket.IO broadcasting to game rooms
 */
export class GameManager {
  private activeGames = new Map<string, GameEngine>();
  private botEngine = new BotEngine();
  private marketBroadcaster: MarketBroadcaster;
  private io: IO | null = null;

  constructor(marketBroadcaster: MarketBroadcaster) {
    this.marketBroadcaster = marketBroadcaster;
  }

  /**
   * Initialize with Socket.IO and start market broadcasting.
   */
  init(io: IO): void {
    this.io = io;
    this.marketBroadcaster.start(io);
    log.info('GameManager initialized');
  }

  /**
   * Create a new game and return its ID.
   */
  async createGame(
    hostId: string,
    hostName: string,
    mode: 'SinglePlayer' | 'Multiplayer',
  ): Promise<string> {
    const game = await prisma.game.create({
      data: {
        mode,
        status: 'waiting',
        vixLevel: 18,
        currentTurn: 0,
        players: {
          create: {
            userId: hostId,
            displayName: hostName,
            capital: 100,
            position: 1,
            turnOrder: 0,
          },
        },
      },
    });

    const state: GameState = {
      gameId: game.id,
      mode,
      status: 'waiting',
      players: [this.createPlayerState(hostId, hostName, 0)],
      currentPlayerIndex: 0,
      currentTurn: 0,
      vixLevel: 18,
      winnerId: null,
      turnHistory: [],
    };

    const engine = new GameEngine(state);
    this.activeGames.set(game.id, engine);

    log.info({ gameId: game.id, mode, host: hostName }, 'Game created');
    return game.id;
  }

  /**
   * Add a human player to a waiting game.
   */
  async joinGame(gameId: string, userId: string, displayName: string): Promise<void> {
    const engine = this.getEngine(gameId);
    const state = engine.getState();

    if (state.status !== 'waiting') {
      throw new Error('Cannot join a game that is not in waiting state');
    }

    if (state.players.length >= 4) {
      throw new Error('Game is full (max 4 players)');
    }

    const turnOrder = state.players.length;
    const player = this.createPlayerState(userId, displayName, turnOrder);

    // Mutate engine state (allowed since we control the lifecycle)
    (state as any).players.push(player);

    // Persist to DB
    await prisma.gamePlayer.create({
      data: {
        gameId,
        userId,
        displayName,
        capital: 100,
        position: 1,
        turnOrder,
      },
    });

    this.broadcastToGame(gameId, 'game:playerJoined', {
      gameId,
      playerId: userId,
      displayName,
    });

    log.info({ gameId, userId, displayName }, 'Player joined');
  }

  /**
   * Add a bot to a waiting game.
   */
  async addBot(gameId: string, difficulty: BotDifficulty): Promise<void> {
    const engine = this.getEngine(gameId);
    const state = engine.getState();

    if (state.players.length >= 4) {
      throw new Error('Game is full');
    }

    const turnOrder = state.players.length;
    const botId = `bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const botName = `Bot_${difficulty}_${turnOrder}`;

    const player = this.createPlayerState(botId, botName, turnOrder, true, difficulty);
    (state as any).players.push(player);

    await prisma.gamePlayer.create({
      data: {
        gameId,
        displayName: botName,
        capital: 100,
        position: 1,
        turnOrder,
        isBot: true,
        botDifficulty: difficulty,
      },
    });

    log.info({ gameId, botName, difficulty }, 'Bot added');
  }

  /**
   * Start the game.
   */
  async startGame(gameId: string): Promise<void> {
    const engine = this.getEngine(gameId);
    engine.start();

    await prisma.game.update({
      where: { id: gameId },
      data: { status: 'in_progress', currentTurn: 1 },
    });

    // Sync VIX to engine
    const vix = this.marketBroadcaster.getVIXSimulator().getLevel();
    engine.setVixLevel(vix.value);

    this.broadcastToGame(gameId, 'game:started', {
      gameId,
      players: engine.getPlayers(),
      vixLevel: vix,
    });

    log.info({ gameId }, 'Game started');

    // If the first player is a bot, auto-play
    await this.scheduleIfBotTurn(gameId);
  }

  /**
   * Execute a human player's turn.
   */
  async executeTurn(
    gameId: string,
    playerId: string,
    view: MarketView,
    conviction: ConvictionLevel,
  ): Promise<TurnResult> {
    const engine = this.getEngine(gameId);
    const currentPlayer = engine.getCurrentPlayer();

    if (currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }

    if (currentPlayer.isBot) {
      throw new Error('Cannot execute turn for a bot');
    }

    const result = engine.executeTurn(view, conviction);

    // Persist turn
    await this.persistTurn(gameId, result);

    // Update player state in DB
    await this.persistPlayerState(gameId, currentPlayer);

    // Broadcast result
    this.broadcastToGame(gameId, 'game:turnResult', result as any);

    // Check game end
    if (engine.getState().status === 'completed') {
      await this.handleGameEnd(gameId);
    } else {
      // Schedule bot turn if next player is a bot
      await this.scheduleIfBotTurn(gameId);
    }

    return result;
  }

  /**
   * If the current player is a bot, schedule their turn with a thinking delay.
   */
  private async scheduleIfBotTurn(gameId: string): Promise<void> {
    const engine = this.activeGames.get(gameId);
    if (!engine) return;

    const state = engine.getState();
    if (state.status !== 'in_progress') return;

    const currentPlayer = engine.getCurrentPlayer();
    if (!currentPlayer.isBot) return;

    const difficulty = (currentPlayer.botDifficulty ?? 'adaptive') as BotDifficulty;

    // Simulate thinking delay
    await this.botEngine.simulateThinkingDelay(difficulty);

    // Get VIX level
    const vixLevel = this.marketBroadcaster.getVIXSimulator().getLevel();
    engine.setVixLevel(vixLevel.value);

    // Get bot decision
    const opponents = state.players.filter((p) => p.id !== currentPlayer.id && !p.isMarginCalled);
    const decision = this.botEngine.decide(currentPlayer, vixLevel, opponents);

    // Execute turn
    const result = engine.executeTurn(decision.view, decision.conviction);

    await this.persistTurn(gameId, result);
    await this.persistPlayerState(gameId, currentPlayer);

    this.broadcastToGame(gameId, 'game:turnResult', result as any);

    if (engine.getState().status === 'completed') {
      await this.handleGameEnd(gameId);
    } else {
      // Chain: if next player is also a bot, schedule recursively
      await this.scheduleIfBotTurn(gameId);
    }
  }

  /**
   * Handle game completion: update DB, broadcast, update leaderboard.
   */
  private async handleGameEnd(gameId: string): Promise<void> {
    const engine = this.getEngine(gameId);
    const state = engine.getState();

    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'completed',
        winnerId: state.winnerId,
        currentTurn: state.currentTurn,
      },
    });

    // Update leaderboard for human players
    for (const player of state.players) {
      if (player.isBot) continue;

      // Read existing record for max comparison
      const existing = await prisma.leaderboard.findUnique({ where: { userId: player.id } });
      const bestCapital = Math.max(player.capital, existing?.highestCapital ?? 0);

      await prisma.leaderboard.upsert({
        where: { userId: player.id },
        create: {
          userId: player.id,
          gamesPlayed: 1,
          gamesWon: player.id === state.winnerId ? 1 : 0,
          highestCapital: player.capital,
          longestStreak: player.id === state.winnerId ? 1 : 0,
          totalCapitalEarned: Math.max(0, player.capital - 100),
        },
        update: {
          gamesPlayed: { increment: 1 },
          gamesWon: { increment: player.id === state.winnerId ? 1 : 0 },
          highestCapital: bestCapital,
          totalCapitalEarned: { increment: Math.max(0, player.capital - 100) },
        },
      });
    }

    this.broadcastToGame(gameId, 'game:gameOver', {
      winnerId: state.winnerId,
      reason: state.winnerId ? 'Player reached position 100' : 'Game ended',
      finalStandings: state.players.map((p) => ({
        playerId: p.id,
        displayName: p.displayName,
        capital: p.capital,
        position: p.position,
        isBot: p.isBot,
      })),
    } as any);

    // Remove from active games after a delay (allow clients to see results)
    setTimeout(() => this.activeGames.delete(gameId), 60000);

    log.info({ gameId, winnerId: state.winnerId }, 'Game ended');
  }

  // ── Helpers ──

  /**
   * Get a snapshot of the current game state (for syncing to clients).
   */
  getGameSnapshot(gameId: string): {
    gameId: string;
    players: Player[];
    currentTurnPlayerId: string;
    turnNumber: number;
    status: string;
    vixLevel: number;
  } {
    const engine = this.getEngine(gameId);
    const state = engine.getState();
    return {
      gameId: state.gameId,
      players: [...state.players],
      currentTurnPlayerId: state.players[state.currentPlayerIndex]?.id ?? '',
      turnNumber: state.currentTurn,
      status: state.status,
      vixLevel: state.vixLevel,
    };
  }

  /**
   * Check if a game exists and is active.
   */
  hasGame(gameId: string): boolean {
    return this.activeGames.has(gameId);
  }

  private getEngine(gameId: string): GameEngine {
    const engine = this.activeGames.get(gameId);
    if (!engine) throw new Error(`Game ${gameId} not found or not active`);
    return engine;
  }

  private createPlayerState(
    id: string,
    displayName: string,
    turnOrder: number,
    isBot = false,
    botDifficulty?: BotDifficulty,
  ): Player {
    return {
      id,
      displayName,
      capital: 100,
      position: 1,
      currentView: 'Neutral',
      conviction: 1,
      buffs: [],
      stunTurns: 0,
      isMarginCalled: false,
      isBot,
      botDifficulty,
      pnlHistory: [100],
      turnOrder,
    };
  }

  private broadcastToGame(gameId: string, event: string, data: any): void {
    if (this.io) {
      this.io.of('/game').to(`game:${gameId}`).emit(event as any, data);
    }
  }

  private async persistTurn(gameId: string, result: TurnResult): Promise<void> {
    const player = await prisma.gamePlayer.findFirst({
      where: {
        gameId,
        OR: [
          { userId: result.playerId },
          { displayName: result.playerId },
          // For bots: the player.id in engine is the generated botId,
          // but in DB we store by displayName. Look up via display name match.
          { id: result.playerId },
        ],
      },
    });

    if (player) {
      await prisma.turnLog.create({
        data: {
          gameId,
          playerId: player.id,
          turnNumber: result.turnNumber,
          command: JSON.stringify({}), // simplified – full command would be passed
          result: JSON.stringify(result),
        },
      });
    }
  }

  private async persistPlayerState(gameId: string, player: Player): Promise<void> {
    const dbPlayer = await prisma.gamePlayer.findFirst({
      where: {
        gameId,
        OR: [
          { userId: player.id },
          { displayName: player.displayName },
          { id: player.id },
        ],
      },
    });

    if (dbPlayer) {
      await prisma.gamePlayer.update({
        where: { id: dbPlayer.id },
        data: {
          capital: player.capital,
          position: player.position,
          currentView: player.currentView,
          conviction: player.conviction,
          stunTurns: player.stunTurns,
          isMarginCalled: player.isMarginCalled,
          activeBuffs: JSON.stringify(player.buffs),
          pnlHistory: JSON.stringify(player.pnlHistory),
          hasWon: player.position === 100,
        },
      });
    }
  }

  /**
   * Cleanup: stop market broadcaster.
   */
  shutdown(): void {
    this.marketBroadcaster.stop();
    this.activeGames.clear();
    log.info('GameManager shut down');
  }
}
