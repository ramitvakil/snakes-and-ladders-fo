import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  MarketView,
  ConvictionLevel,
} from '@game/shared';
import type { GameManager } from '../../services/GameManager.js';
import { createChildLogger } from '../../config/logger.js';

type GameIO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

const log = createChildLogger('ws:turn');

// Per-socket state for view/conviction before dice roll
const playerTurnState = new Map<string, { gameId?: string; view?: MarketView; conviction?: ConvictionLevel }>();

/**
 * Handles turn-related socket events on the /game namespace.
 */
export function registerTurnHandler(_io: GameIO, socket: GameSocket, gameManager: GameManager) {
  /**
   * game:joinGame – Player joins a game room and receives state sync.
   */
  socket.on('game:joinGame', (data, ack) => {
    const { gameId } = data as { gameId: string };
    const userId = socket.user?.userId;

    if (!gameId || !userId) {
      socket.emit('game:error', { message: 'Invalid join request', code: 'INVALID_JOIN' });
      if (typeof ack === 'function') ack(false);
      return;
    }

    socket.join(`game:${gameId}`);
    log.info({ userId, gameId }, 'Player joined game room');

    // Send current state
    try {
      const snapshot = gameManager.getGameSnapshot(gameId);
      socket.emit('game:stateSync', {
        gameId: snapshot.gameId,
        players: snapshot.players,
        currentTurnPlayerId: snapshot.currentTurnPlayerId,
        turnNumber: snapshot.turnNumber,
        turnPhase: 'view_selection',
        vixLevel: snapshot.vixLevel,
        marketTrend: 'Neutral',
        activeQuests: [],
      } as any);
      if (typeof ack === 'function') ack(true);
    } catch (err) {
      log.warn({ err, gameId }, 'Failed to sync game state');
      socket.emit('game:error', { message: 'Game not found or not active', code: 'GAME_NOT_FOUND' });
      if (typeof ack === 'function') ack(false);
    }
  });

  /**
   * game:setView – Player declares their market view for this turn.
   */
  socket.on('game:setView', (data) => {
    const { gameId, view } = data as { gameId: string; view: MarketView };
    const state = playerTurnState.get(socket.id) ?? {};
    state.gameId = gameId;
    state.view = view;
    playerTurnState.set(socket.id, state);
    log.info({ userId: socket.user?.userId, gameId, view }, 'View set');
  });

  /**
   * game:setConviction – Player sets conviction multiplier (1-5).
   */
  socket.on('game:setConviction', (data) => {
    const { gameId, conviction } = data as { gameId: string; conviction: number };
    const state = playerTurnState.get(socket.id) ?? {};
    state.gameId = gameId;
    state.conviction = conviction as ConvictionLevel;
    playerTurnState.set(socket.id, state);
    log.info({ userId: socket.user?.userId, gameId, conviction }, 'Conviction set');
  });

  /**
   * game:rollDice – Player rolls the dice, triggering a full turn pipeline.
   */
  socket.on('game:rollDice', async (data) => {
    try {
      const { gameId } = data as { gameId: string };
      const userId = socket.user?.userId;

      if (!gameId || !userId) {
        socket.emit('game:error', { message: 'Invalid roll request', code: 'INVALID_ROLL' });
        return;
      }

      // Get stored view/conviction for this player
      const turnState = playerTurnState.get(socket.id);
      const view = turnState?.view ?? 'Neutral';
      const conviction = turnState?.conviction ?? 1;

      log.info({ userId, gameId, view, conviction }, 'Dice roll requested');

      const result = await gameManager.executeTurn(gameId, userId, view, conviction);

      // Clear turn state
      playerTurnState.delete(socket.id);

      log.info({ userId, gameId, newPosition: result.newPosition, capital: result.finalCapital }, 'Turn completed');
    } catch (err: any) {
      log.warn({ err: err?.message, socketId: socket.id }, 'Turn execution failed');
      socket.emit('game:error', { message: err?.message ?? 'Turn failed', code: 'TURN_ERROR' });
    }
  });

  /**
   * game:requestSync – Player reconnects to a game in progress.
   */
  socket.on('game:requestSync', (data) => {
    const { gameId } = data as { gameId: string };
    socket.join(`game:${gameId}`);

    try {
      const snapshot = gameManager.getGameSnapshot(gameId);
      socket.emit('game:stateSync', {
        gameId: snapshot.gameId,
        players: snapshot.players,
        currentTurnPlayerId: snapshot.currentTurnPlayerId,
        turnNumber: snapshot.turnNumber,
        turnPhase: 'view_selection',
        vixLevel: snapshot.vixLevel,
        marketTrend: 'Neutral',
        activeQuests: [],
      } as any);
    } catch {
      socket.emit('game:error', { message: 'Game not found', code: 'GAME_NOT_FOUND' });
    }

    log.info({ userId: socket.user?.userId, gameId }, 'Player rejoined game room');
  });

  socket.on('disconnect', () => {
    playerTurnState.delete(socket.id);
  });
}
