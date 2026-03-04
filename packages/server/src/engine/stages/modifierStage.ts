import { DEFAULT_GREEK_CONFIG, TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';

/**
 * MODIFIER stage: Apply Greek modifiers (Theta decay, Gamma acceleration, Vega VIX penalty).
 */
export const modifierStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.MODIFIER;

  const config = DEFAULT_GREEK_CONFIG;
  const vixLevel = ctx.command.vixLevel;

  // ── Theta Decay: Lose a % of capital per turn (time decay) ──
  const thetaLoss = ctx.player.capital * (config.theta.decayPerTurnPercent / 100);
  ctx.meta['thetaDelta'] = -thetaLoss;
  ctx.result.thetaApplied = thetaLoss > 0;
  ctx.appliedModifiers.push({
    name: 'Theta Decay',
    type: 'theta',
    value: -thetaLoss,
    source: 'greek',
  });

  // ── Gamma: Movement multiplier when consecutive correct views ──
  // If view matched last turn (tracked in meta), apply gamma multiplier
  const consecutiveCorrect = (ctx.meta['consecutiveCorrect'] as number) ?? 0;
  let gammaMultiplier = 1;
  if (consecutiveCorrect >= 2) {
    gammaMultiplier = config.gamma.consecutiveCorrectMultiplier;
  } else if (consecutiveCorrect >= 1) {
    gammaMultiplier = config.gamma.onCorrectViewMultiplier;
  }
  ctx.result.gammaMultiplier = gammaMultiplier;

  if (gammaMultiplier > 1) {
    ctx.appliedModifiers.push({
      name: 'Gamma Acceleration',
      type: 'gamma',
      value: gammaMultiplier,
      source: 'greek',
    });
  }

  // ── Vega: VIX-based penalty on wrong views ──
  ctx.result.vixLevel = vixLevel;
  const isHighVix = vixLevel >= config.vega.vixThreshold;
  ctx.result.vixPenaltyApplied = false;

  if (isHighVix) {
    // VIX penalty will be applied in capital stage if view was wrong
    ctx.meta['vixPenalty'] = true;
    ctx.appliedModifiers.push({
      name: 'Vega – High Volatility',
      type: 'vega',
      value: vixLevel,
      source: 'greek',
    });
  }

  next();
};
