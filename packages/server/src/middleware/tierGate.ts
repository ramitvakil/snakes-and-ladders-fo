import type { Request, Response, NextFunction } from 'express';
import { SubscriptionTier, tierMeetsMinimum } from '@game/shared';

/**
 * Express middleware factory that gates routes behind a minimum subscription tier.
 *
 * Usage:
 *   router.get('/premium', authMiddleware, tierGate('MarketWarrior'), handler)
 */
export function tierGate(requiredTier: SubscriptionTier) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userTier = (req.user?.tier ?? SubscriptionTier.Apprentice) as SubscriptionTier;

    if (!tierMeetsMinimum(userTier, requiredTier)) {
      res.status(403).json({
        error: 'Subscription tier insufficient',
        required: requiredTier,
        current: userTier,
      });
      return;
    }

    next();
  };
}
