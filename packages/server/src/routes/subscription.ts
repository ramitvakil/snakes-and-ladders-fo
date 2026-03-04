import { Router } from 'express';
import { UpgradeTierInputSchema, SubscriptionTier, TIER_DEFINITIONS } from '@game/shared';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';

const router: ReturnType<typeof Router> = Router();

/**
 * GET /api/subscription/tiers – List available tiers with features
 */
router.get('/tiers', (_req, res) => {
  res.json({ tiers: TIER_DEFINITIONS });
});

/**
 * GET /api/subscription/me – Current user's subscription status
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { tier: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const tierDef = TIER_DEFINITIONS[user.tier as SubscriptionTier];

    res.json({
      tier: user.tier,
      features: tierDef?.features ?? null,
    });
  }),
);

/**
 * POST /api/subscription/upgrade – Upgrade subscription tier
 *
 * In production this would integrate with a payment gateway (Razorpay/Stripe).
 * For now it directly upgrades after "validating" the request.
 */
router.post(
  '/upgrade',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const body = UpgradeTierInputSchema.parse(req.body);
    const targetTier = body.tier as SubscriptionTier;

    const tierOrder = [
      SubscriptionTier.Apprentice,
      SubscriptionTier.MarketWarrior,
      SubscriptionTier.BillionaireGuild,
    ];
    const currentIdx = tierOrder.indexOf(req.user!.tier as SubscriptionTier);
    const targetIdx = tierOrder.indexOf(targetTier);

    if (targetIdx <= currentIdx) {
      res.status(400).json({ error: 'Cannot downgrade or upgrade to same tier' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { tier: targetTier },
      select: { id: true, tier: true },
    });

    res.json({ message: `Upgraded to ${targetTier}`, user });
  }),
);

export default router;
