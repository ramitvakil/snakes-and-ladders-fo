import type { Express } from 'express';
import { requestLogger } from '../middleware/requestLogger.js';
import { errorHandler } from '../middleware/errorHandler.js';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import gameRoutes from './game.js';
import playerRoutes from './player.js';
import subscriptionRoutes from './subscription.js';

export function registerRoutes(app: Express) {
  // Request logging (before routes)
  app.use(requestLogger);

  // Public routes
  app.use('/', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/games', gameRoutes);
  app.use('/api/players', playerRoutes);
  app.use('/api/subscription', subscriptionRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler (must be last)
  app.use(errorHandler);
}
