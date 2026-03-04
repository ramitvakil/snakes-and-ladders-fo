import { TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';

/**
 * CAPITAL stage: Aggregate all capital deltas from previous stages
 * and compute the final capital.
 */
export const capitalStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.CAPITAL;

  const thetaDelta = (ctx.meta['thetaDelta'] as number) ?? 0;
  const tileCapitalDelta = (ctx.meta['tileCapitalDelta'] as number) ?? 0;
  const viewDelta = (ctx.meta['viewDelta'] as number) ?? 0;

  // Apply active buffs that modify capital
  let buffMultiplier = 1;
  const expiredBuffs: number[] = [];

  ctx.player.buffs.forEach((buff, i) => {
    if (buff.type === 'capital_multiplier' || buff.type === 'earnings_boost') {
      buffMultiplier *= buff.multiplier;
    }
    // Decrement buff durations
    buff.turnsRemaining -= 1;
    if (buff.turnsRemaining <= 0) {
      expiredBuffs.push(i);
    }
  });

  // Remove expired buffs (reverse to maintain indices)
  for (const i of expiredBuffs.reverse()) {
    ctx.player.buffs.splice(i, 1);
  }

  // Total delta
  const totalDelta = (thetaDelta + tileCapitalDelta + viewDelta) * buffMultiplier;

  const finalCapital = Math.max(0, ctx.player.capital + totalDelta);

  ctx.result.capitalDelta = Number(totalDelta.toFixed(2));
  ctx.result.finalCapital = Number(finalCapital.toFixed(2));
  ctx.player.capital = finalCapital;

  next();
};
