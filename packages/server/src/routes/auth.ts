import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterInputSchema, LoginInputSchema, SubscriptionTier } from '@game/shared';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, type AuthPayload } from '../middleware/auth.js';

const router: ReturnType<typeof Router> = Router();

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = RegisterInputSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        displayName: body.displayName,
        tier: SubscriptionTier.Apprentice,
      },
    });

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      tier: user.tier,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        tier: user.tier,
      },
      token,
    });
  }),
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = LoginInputSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      tier: user.tier,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        tier: user.tier,
      },
      token,
    });
  }),
);

/**
 * GET /api/auth/me – Return current user profile
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        tier: true,
        createdAt: true,
        leaderboard: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  }),
);

export default router;
