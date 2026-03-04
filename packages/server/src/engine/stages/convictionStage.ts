import { getConvictionScalar, TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';

/**
 * CONVICTION stage: Determine if the player's view matched the market,
 * and compute the conviction-scaled capital gain/loss.
 */
export const convictionStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.CONVICTION;

  const declaredView = ctx.command.declaredView;
  const marketOutcome = ctx.command.marketOutcome;
  const conviction = ctx.command.convictionMultiplier;

  ctx.result.declaredView = declaredView;
  ctx.result.marketOutcome = marketOutcome;
  ctx.result.convictionMultiplier = conviction;

  // View match check
  const viewMatched =
    declaredView === marketOutcome ||
    (declaredView === 'Neutral' && marketOutcome === 'Sideways');

  ctx.result.viewMatched = viewMatched;

  // Conviction scalar: how much to multiply the gain/loss
  const scalar = getConvictionScalar(conviction);

  // Base capital change from view match/mismatch
  const gammaMultiplier = ctx.result.gammaMultiplier ?? 1;
  let viewDelta: number;

  if (viewMatched) {
    // Correct view: earn capital proportional to conviction and gamma
    viewDelta = 5 * scalar * gammaMultiplier;
  } else {
    // Wrong view: lose capital proportional to conviction
    viewDelta = -3 * scalar;

    // VIX penalty amplification for wrong views
    if (ctx.meta['vixPenalty']) {
      const vixLevel = ctx.command.vixLevel;
      const vixMultiplier = 1 + (vixLevel - 25) * 0.02; // Extra 2% per VIX point above 25
      viewDelta *= Math.max(1, vixMultiplier);
      ctx.result.vixPenaltyApplied = true;
    }
  }

  ctx.meta['viewDelta'] = viewDelta;

  next();
};
