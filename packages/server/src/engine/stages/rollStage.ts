import { rollDice, TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';

/**
 * ROLL stage: Determines the dice roll for this turn.
 * If the command already includes a diceRoll (e.g. from testing), use that.
 * Otherwise, generate a random roll.
 */
export const rollStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.ROLL;

  // Check if player is stunned
  if (ctx.player.stunTurns > 0) {
    ctx.result.diceRoll = 0;
    ctx.result.isStunned = true;
    ctx.result.spacesMovedRaw = 0;
    ctx.result.newPosition = ctx.player.position;
    ctx.halted = true;
    ctx.haltReason = `Player stunned for ${ctx.player.stunTurns} more turns`;

    // Decrement stun but preserve in result
    ctx.player.stunTurns -= 1;
    ctx.result.finalCapital = ctx.player.capital;
    ctx.result.capitalDelta = 0;
    ctx.result.declaredView = ctx.command.declaredView;
    ctx.result.marketOutcome = ctx.command.marketOutcome;
    ctx.result.viewMatched = false;
    ctx.result.convictionMultiplier = 0;
    ctx.result.gammaMultiplier = 1;
    ctx.result.thetaApplied = false;
    ctx.result.vixLevel = ctx.command.vixLevel;
    ctx.result.vixPenaltyApplied = false;
    ctx.result.tileEffect = null;
    ctx.result.tileName = null;
    return;
  }

  const roll = ctx.command.diceRoll ?? rollDice();
  ctx.result.diceRoll = roll;
  ctx.result.spacesMovedRaw = roll;
  ctx.meta['rawRoll'] = roll;

  next();
};
