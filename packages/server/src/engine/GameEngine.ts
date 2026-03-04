import type { Player, TurnCommand, TurnResult, MarketView, ConvictionLevel } from '@game/shared';
import { generateMarketOutcome, rollDice } from '@game/shared';
import { TurnEngine } from './TurnEngine.js';
import { createChildLogger } from '../config/logger.js';

const log = createChildLogger('engine:game');

export interface GameState {
  gameId: string;
  mode: 'SinglePlayer' | 'Multiplayer';
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  players: Player[];
  currentPlayerIndex: number;
  currentTurn: number;
  vixLevel: number;
  winnerId: string | null;
  turnHistory: TurnResult[];
}

/**
 * GameEngine manages the state of a single game instance.
 * It orchestrates turn order, delegates turn processing to TurnEngine,
 * and manages game lifecycle (start, turn, end).
 */
export class GameEngine {
  private state: GameState;
  private turnEngine: TurnEngine;

  constructor(state: GameState) {
    this.state = state;
    this.turnEngine = new TurnEngine();
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  getPlayers(): readonly Player[] {
    return this.state.players;
  }

  getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex]!;
  }

  getVixLevel(): number {
    return this.state.vixLevel;
  }

  setVixLevel(level: number): void {
    this.state.vixLevel = Math.max(10, Math.min(80, level));
  }

  /**
   * Start the game. Sets status to in_progress.
   */
  start(): void {
    if (this.state.status !== 'waiting') {
      throw new Error(`Cannot start game in ${this.state.status} state`);
    }

    if (this.state.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    this.state.status = 'in_progress';
    this.state.currentPlayerIndex = 0;
    this.state.currentTurn = 1;

    log.info(
      { gameId: this.state.gameId, players: this.state.players.length },
      'Game started',
    );
  }

  /**
   * Execute a turn for the current player.
   *
   * @param view - The player's declared market view
   * @param conviction - The player's conviction level (1-5)
   * @param forcedDice - Optional forced dice roll (for testing/bots)
   * @returns The TurnResult
   */
  executeTurn(
    view: MarketView,
    conviction: ConvictionLevel,
    forcedDice?: number,
  ): TurnResult {
    if (this.state.status !== 'in_progress') {
      throw new Error(`Cannot execute turn: game is ${this.state.status}`);
    }

    const player = this.getCurrentPlayer();

    if (player.isMarginCalled) {
      throw new Error(`Player ${player.id} is margin called and eliminated`);
    }

    const command: TurnCommand = {
      playerId: player.id,
      gameId: this.state.gameId,
      turnNumber: this.state.currentTurn,
      declaredView: view,
      convictionMultiplier: conviction,
      diceRoll: forcedDice ?? rollDice(),
      marketOutcome: generateMarketOutcome(this.state.vixLevel),
      vixLevel: this.state.vixLevel,
    };

    const result = this.turnEngine.processTurn(player, command);

    // Update player state from result
    this.updatePlayerFromResult(player, result);

    // Store turn history
    this.state.turnHistory.push(result);

    // Check for game end
    if (result.isGameWon) {
      this.state.status = 'completed';
      this.state.winnerId = player.id;
      log.info({ gameId: this.state.gameId, winnerId: player.id }, 'Game won');
    }

    // Check if all other players are margin called
    const activePlayers = this.state.players.filter((p) => !p.isMarginCalled);
    if (activePlayers.length <= 1 && !result.isGameWon) {
      this.state.status = 'completed';
      this.state.winnerId = activePlayers[0]?.id ?? null;
      log.info(
        { gameId: this.state.gameId, winnerId: this.state.winnerId },
        'Game ended – all opponents margin called',
      );
    }

    // Advance to next player
    if (this.state.status === 'in_progress') {
      this.advanceToNextPlayer();
    }

    return result;
  }

  /**
   * Advance to the next active (non-margin-called) player.
   */
  private advanceToNextPlayer(): void {
    const numPlayers = this.state.players.length;
    let nextIndex = (this.state.currentPlayerIndex + 1) % numPlayers;
    let attempts = 0;

    while (attempts < numPlayers) {
      const nextPlayer = this.state.players[nextIndex]!;
      if (!nextPlayer.isMarginCalled) {
        break;
      }
      nextIndex = (nextIndex + 1) % numPlayers;
      attempts++;
    }

    // If we've looped back to the first player, increment turn number
    if (nextIndex <= this.state.currentPlayerIndex) {
      this.state.currentTurn++;
    }

    this.state.currentPlayerIndex = nextIndex;
  }

  /**
   * Update a player's state with values from the turn result.
   */
  private updatePlayerFromResult(player: Player, result: TurnResult): void {
    player.position = result.newPosition;
    player.capital = result.finalCapital;
    player.isMarginCalled = result.isMarginCall;

    if (result.isStunned) {
      player.stunTurns = Math.max(player.stunTurns, 2);
    }

    if (result.viewMatched) {
      player.currentView = result.declaredView as MarketView;
    }

    // Track PnL
    if (!player.pnlHistory) {
      player.pnlHistory = [];
    }
    player.pnlHistory.push(result.finalCapital);
  }

  /**
   * Serialize game state for persistence or snapshot.
   */
  toSnapshot(): GameState {
    return { ...this.state };
  }

  /**
   * Create a GameEngine from a snapshot.
   */
  static fromSnapshot(snapshot: GameState): GameEngine {
    return new GameEngine(snapshot);
  }
}
