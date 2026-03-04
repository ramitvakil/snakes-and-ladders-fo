import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import type { AuthPayload } from '../../middleware/auth.js';

declare module 'socket.io' {
  interface Socket {
    user?: AuthPayload;
  }
}

/**
 * Socket.IO auth middleware – verifies JWT from handshake auth.token.
 */
export function wsAuth(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    logger.warn({ socketId: socket.id }, 'WS connection rejected: no token');
    next(new Error('Authentication required'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    socket.user = payload;
    next();
  } catch (err) {
    logger.warn({ socketId: socket.id, err }, 'WS auth failed');
    next(new Error('Invalid token'));
  }
}

/**
 * Optional auth – used for public namespaces (lobby browsing).
 * Authenticated users get socket.user; anonymous users proceed without it.
 */
export function wsOptionalAuth(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token as string | undefined;

  if (token) {
    try {
      socket.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      logger.debug({ socketId: socket.id, userId: socket.user.userId }, 'WS optional auth: authenticated');
    } catch (err) {
      logger.warn({ socketId: socket.id, err }, 'WS optional auth: token invalid/expired – continuing as anonymous');
    }
  } else {
    logger.debug({ socketId: socket.id }, 'WS optional auth: no token – anonymous connection');
  }

  next();
}
