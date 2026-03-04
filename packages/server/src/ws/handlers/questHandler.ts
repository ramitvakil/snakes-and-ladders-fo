import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
} from '@game/shared';
import { createChildLogger } from '../../config/logger.js';

type MarketIO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
type MarketSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

const log = createChildLogger('ws:quest');

/**
 * Handles quest/market-related socket events on the /market namespace.
 */
export function registerQuestHandler(_io: MarketIO, socket: MarketSocket) {
  /**
   * Client subscribes to market updates for their tier channel.
   */
  socket.on('market:subscribe', (data) => {
    const tier = data.tier;
    socket.join(`market:${tier}`);
    log.info({ userId: (socket as any).user?.userId, tier }, 'Subscribed to market channel');
  });

  /**
   * Client accepts a quest.
   */
  socket.on('market:acceptQuest', (data) => {
    log.debug({ userId: (socket as any).user?.userId, questId: data.questId }, 'Quest accepted');
  });

  socket.on('disconnect', () => {
    log.debug({ userId: (socket as any).user?.userId, socketId: socket.id }, 'Market socket disconnected');
  });
}
