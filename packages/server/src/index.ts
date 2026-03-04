import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents } from '@game/shared';

import { env } from './config/env.js';
import { getCorsOptions } from './config/cors.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

// ─── Express ───
const app: ReturnType<typeof express> = express();
const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Security ───
app.use(helmet({
  contentSecurityPolicy: false, // SPA handles its own CSP
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources
}));
app.set('trust proxy', 1); // Trust first proxy (Render's load balancer)
app.use('/api/', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

// Request ID middleware
app.use((_req, res, next) => {
  const id = _req.headers['x-request-id'] ?? crypto.randomUUID();
  res.setHeader('X-Request-ID', id);
  next();
});

// ─── HTTP Server ───
const server = http.createServer(app);

// ─── Socket.IO ───
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(
  server,
  {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    maxHttpBufferSize: 1e6, // 1 MB
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 min
      skipMiddlewares: false,
    },
  },
);

// ─── Startup ───
async function start() {
  // Connect Redis adapter for multi-instance support (skip if no REDIS_URL)
  if (env.REDIS_URL) {
    try {
      const pubClient = new Redis(env.REDIS_URL);
      const subClient = new Redis(env.REDIS_URL);

      await new Promise<void>((resolve, reject) => {
        let connected = 0;
        const onReady = () => { connected++; if (connected === 2) resolve(); };
        pubClient.on('ready', onReady);
        subClient.on('ready', onReady);
        pubClient.on('error', reject);
        subClient.on('error', reject);
        if (pubClient.status === 'ready') { connected++; }
        if (subClient.status === 'ready') { connected++; }
        if (connected === 2) resolve();
      });

      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Redis pub/sub adapter connected');
    } catch (err) {
      logger.warn({ err }, 'Redis not available – falling back to in-memory adapter');
    }
  } else {
    logger.info('No REDIS_URL – using in-memory Socket.IO adapter');
  }

  // Test DB connection
  await prisma.$connect();
  logger.info('Database connected');

  // Register routes (lazy import to keep this file lean)
  const { registerRoutes } = await import('./routes/index.js');
  registerRoutes(app);

  // Initialize GameManager
  const { gameManager } = await import('./services/gameManagerSingleton.js');
  gameManager.init(io);

  // Register WebSocket handlers
  const { registerSocketHandlers } = await import('./ws/index.js');
  registerSocketHandlers(io, gameManager);

  server.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        demo: env.DEMO_MODE,
      },
      `🐍 Snakes & Ladders F&O server listening on :${env.PORT}`,
    );
  });
}

// ─── Graceful Shutdown ───
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down…');

  server.close(() => {
    logger.info('HTTP server closed');
  });

  io.close();
  await prisma.$disconnect();
  logger.info('Cleanup complete. Exiting.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection');
  process.exit(1);
});

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});

export { app, io, server };
