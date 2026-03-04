import type { Socket } from 'socket.io';
import { SubscriptionTier, tierMeetsMinimum } from '@game/shared';

/**
 * Socket.IO middleware factory that gates namespace access by subscription tier.
 */
export function wsTierGate(requiredTier: SubscriptionTier) {
  return (socket: Socket, next: (err?: Error) => void) => {
    const userTier = ((socket as any).user?.tier ?? SubscriptionTier.Apprentice) as SubscriptionTier;

    if (!tierMeetsMinimum(userTier, requiredTier)) {
      next(
        new Error(
          `Subscription tier insufficient. Required: ${requiredTier}, Current: ${userTier}`,
        ),
      );
      return;
    }

    next();
  };
}
