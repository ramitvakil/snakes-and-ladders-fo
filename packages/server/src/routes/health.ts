import { Router } from 'express';
import { prisma } from '../config/prisma.js';

const router: ReturnType<typeof Router> = Router();

/**
 * GET /healthz – Liveness probe. Always returns 200 if process is alive.
 */
router.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /readyz – Readiness probe. Checks DB connectivity.
 */
router.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      checks: { database: 'connected' },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'not ready',
      checks: { database: 'disconnected' },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
