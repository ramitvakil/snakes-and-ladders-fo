import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';

const router: ReturnType<typeof Router> = Router();

/**
 * GET /api/players/me/stats – Aggregated stats for the current user
 */
router.get(
  '/me/stats',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const leaderboard = await prisma.leaderboard.findUnique({
      where: { userId: req.user!.userId },
    });

    const activeGames = await prisma.game.count({
      where: {
        status: { in: ['waiting', 'in_progress'] },
        players: { some: { userId: req.user!.userId } },
      },
    });

    res.json({
      stats: leaderboard ?? {
        gamesPlayed: 0,
        gamesWon: 0,
        highestCapital: 0,
        longestStreak: 0,
        totalCapitalEarned: 0,
      },
      activeGames,
    });
  }),
);

/**
 * GET /api/players/leaderboard – Global leaderboard
 */
router.get(
  '/leaderboard',
  asyncHandler(async (req, res) => {
    const { sortBy = 'gamesWon', limit = '20' } = req.query;

    const validSorts = [
      'gamesWon',
      'gamesPlayed',
      'highestCapital',
      'longestStreak',
      'totalCapitalEarned',
    ];
    const orderField = validSorts.includes(sortBy as string) ? (sortBy as string) : 'gamesWon';

    const entries = await prisma.leaderboard.findMany({
      take: Number(limit),
      orderBy: { [orderField]: 'desc' },
      include: {
        user: {
          select: { displayName: true, tier: true },
        },
      },
    });

    res.json({
      leaderboard: entries.map((e: any, i: number) => ({
        rank: i + 1,
        displayName: e.user.displayName,
        tier: e.user.tier,
        gamesPlayed: e.gamesPlayed,
        gamesWon: e.gamesWon,
        highestCapital: e.highestCapital,
        longestStreak: e.longestStreak,
        totalCapitalEarned: e.totalCapitalEarned,
      })),
    });
  }),
);

export default router;
