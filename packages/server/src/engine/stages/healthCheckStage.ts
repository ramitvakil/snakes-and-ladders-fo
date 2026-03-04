import { STUN_THRESHOLD, TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';

/**
 * HEALTH_CHECK stage: Final stage that checks for margin call (capital ≤ 0)
 * and stun conditions.
 */
export const healthCheckStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.HEALTH_CHECK;

  const capital = ctx.result.finalCapital ?? ctx.player.capital;

  // ── Margin Call: capital hits 0 ──
  if (capital <= 0) {
    ctx.result.isMarginCall = true;
    ctx.result.finalCapital = 0;
    ctx.player.isMarginCalled = true;
    ctx.appliedModifiers.push({
      name: 'Margin Call',
      type: 'margin_call' as any,
      value: 0,
      source: 'system',
    });
  }

  // ── Stun Check: capital drops below threshold in one turn ──
  const capitalDelta = ctx.result.capitalDelta ?? 0;
  const previousCapital = ctx.result.previousCapital ?? 100;
  const dropPercent = Math.abs(capitalDelta / previousCapital) * 100;

  if (dropPercent >= STUN_THRESHOLD && !ctx.result.isMarginCall) {
    ctx.result.isStunned = true;
    ctx.player.stunTurns = 2; // STUN_DURATION
    ctx.appliedModifiers.push({
      name: `Flash Crash Stun (${dropPercent.toFixed(1)}% drop)`,
      type: 'stun' as any,
      value: 2,
      source: 'system',
    });
  }

  next();
};
