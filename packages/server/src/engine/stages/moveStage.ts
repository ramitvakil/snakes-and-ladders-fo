import { TILE_LOOKUP, TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';

/**
 * MOVE stage: Calculate the player's new position based on the dice roll.
 * Handles board boundaries (can't move past tile 100), exact-landing win, and bounce-back rule.
 */
export const moveStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.MOVE;

  const roll = ctx.result.spacesMovedRaw ?? 0;
  const currentPos = ctx.player.position;
  let newPos = currentPos + roll;

  // Bounce-back rule: if you overshoot 100, bounce back
  if (newPos > 100) {
    newPos = 100 - (newPos - 100);
  }

  // Clamp to valid range
  newPos = Math.max(1, Math.min(100, newPos));

  ctx.result.newPosition = newPos;
  ctx.player.position = newPos;

  // Check for exact win on tile 100
  if (newPos === 100) {
    ctx.result.isGameWon = true;
  }

  // Look up the tile definition for tile effect stage
  const tile = TILE_LOOKUP.get(newPos);
  if (tile) {
    ctx.meta['landedTile'] = tile;
  }

  next();
};
