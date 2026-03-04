import { Router } from 'express';
import { CreateGameInputSchema } from '@game/shared';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { gameManager } from '../services/gameManagerSingleton.js';

const router: ReturnType<typeof Router> = Router();

/**
 * POST /api/games – Create a new game (wired to GameManager for playability)
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const body = CreateGameInputSchema.parse(req.body);

    const gameId = await gameManager.createGame(
      req.user!.userId,
      req.user!.displayName,
      body.mode,
    );

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    res.status(201).json({ game });
  }),
);

/**
 * GET /api/games – List user's games
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      players: { some: { userId: req.user!.userId } },
    };
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          players: {
            select: {
              id: true,
              displayName: true,
              capital: true,
              position: true,
              isBot: true,
              hasWon: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.game.count({ where }),
    ]);

    res.json({ games, total, page: Number(page), limit: Number(limit) });
  }),
);

/**
 * GET /api/games/:id – Get game details
 */
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id as string },
      include: {
        players: true,
        turnLogs: {
          orderBy: { turnNumber: 'desc' },
          take: 20,
        },
      },
    });

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json({ game });
  }),
);

/**
 * GET /api/games/:id/history – Full turn history
 */
router.get(
  '/:id/history',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const turns = await prisma.turnLog.findMany({
      where: { gameId: req.params.id as string },
      orderBy: { turnNumber: 'asc' },
    });

    res.json({ turns });
  }),
);

export default router;
