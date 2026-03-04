import type { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
} from '@game/shared';
import type { GameManager } from '../services/GameManager.js';
import { wsAuth, wsOptionalAuth } from './middleware/wsAuth.js';
import { registerTurnHandler } from './handlers/turnHandler.js';
import { registerQuestHandler } from './handlers/questHandler.js';
import { registerLobbyHandler } from './handlers/lobbyHandler.js';
import { createChildLogger } from '../config/logger.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

const log = createChildLogger('ws');

export function registerSocketHandlers(io: IO, gameManager: GameManager) {
  // ─── /game namespace – authenticated, turn handling ───
  const gameNs = io.of('/game');
  gameNs.use(wsAuth);
  gameNs.on('connection', (socket) => {
    log.info({ userId: socket.user?.userId, socketId: socket.id }, 'Game socket connected');
    registerTurnHandler(gameNs as any, socket, gameManager);

    socket.on('disconnect', (reason) => {
      log.info({ userId: socket.user?.userId, reason }, 'Game socket disconnected');
    });
  });

  // ─── /market namespace – authenticated, market/quest data ───
  const marketNs = io.of('/market');
  marketNs.use(wsAuth);
  marketNs.on('connection', (socket) => {
    log.info({ userId: socket.user?.userId, socketId: socket.id }, 'Market socket connected');
    registerQuestHandler(marketNs as any, socket);
  });

  // ─── /lobby namespace – optional auth for browsing, auth for actions ───
  const lobbyNs = io.of('/lobby');
  lobbyNs.use(wsOptionalAuth);
  lobbyNs.on('connection', (socket) => {
    log.info(
      { userId: socket.user?.userId ?? 'anonymous', socketId: socket.id },
      'Lobby socket connected',
    );
    registerLobbyHandler(lobbyNs as any, socket, gameManager);
  });

  log.info('WebSocket namespaces registered: /game, /market, /lobby');
}
