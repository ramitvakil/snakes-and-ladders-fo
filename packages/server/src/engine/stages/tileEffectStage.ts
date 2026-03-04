import type { TileDefinition, TileEffect } from '@game/shared';
import { WARP_LOOKUP, TurnPhase } from '@game/shared';
import type { PipelineStage } from '../TurnPipeline.js';
import { createChildLogger } from '../../config/logger.js';

const log = createChildLogger('engine:tileEffect');

/**
 * TILE_EFFECT stage: Apply the effect of the tile the player landed on.
 * Handles ladders, snakes, event tiles, and neutral tiles.
 */
export const tileEffectStage: PipelineStage = (ctx, next) => {
  ctx.phase = TurnPhase.TILE_EFFECT;

  const tile = ctx.meta['landedTile'] as TileDefinition | undefined;

  if (!tile) {
    ctx.result.tileEffect = null;
    ctx.result.tileName = null;
    next();
    return;
  }

  ctx.result.tileName = tile.name ?? null;

  // Check for warp (snake/ladder)
  const warp = WARP_LOOKUP.get(tile.position);
  if (warp) {
    const destination = warp.to;
    const isLadder = destination > tile.position;

    ctx.result.tileEffect = { type: isLadder ? 'warp' : 'warp', warpTo: destination } as TileEffect;
    ctx.result.newPosition = destination;
    ctx.player.position = destination;

    log.info(
      {
        from: tile.position,
        to: destination,
        type: isLadder ? 'ladder' : 'snake',
        name: tile.name,
      },
      'Warp triggered',
    );

    // Check win after warp
    if (destination === 100) {
      ctx.result.isGameWon = true;
    }
  }

  // Apply tile effect
  if (tile.effect) {
    applyTileEffect(ctx, tile.effect, tile);
  }

  next();
};

function applyTileEffect(
  ctx: Parameters<PipelineStage>[0],
  effect: TileEffect,
  tile: TileDefinition,
) {
  switch (effect.type) {
    case 'capital_change': {
      // Percentage-based capital change (e.g. capitalDelta: -5 means lose 5%)
      const delta = ctx.player.capital * ((effect.capitalDelta ?? 0) / 100);
      ctx.meta['tileCapitalDelta'] = (ctx.meta['tileCapitalDelta'] as number ?? 0) + delta;
      ctx.appliedModifiers.push({
        name: `${tile.name} capital change`,
        type: 'capital_change' as any,
        value: effect.capitalDelta ?? 0,
        source: 'tile',
      });
      break;
    }

    case 'capital_percent': {
      const delta = ctx.player.capital * ((effect.value ?? 0) / 100);
      ctx.meta['tileCapitalDelta'] = (ctx.meta['tileCapitalDelta'] as number ?? 0) + delta;
      break;
    }

    case 'capital_flat': {
      ctx.meta['tileCapitalDelta'] = (ctx.meta['tileCapitalDelta'] as number ?? 0) + (effect.value ?? 0);
      break;
    }

    case 'compound': {
      // Process each sub-effect
      if (effect.subEffects) {
        for (const sub of effect.subEffects) {
          applyTileEffect(ctx, sub, tile);
        }
      }
      break;
    }

    case 'buff': {
      if (effect.buffType && effect.duration) {
        ctx.player.buffs.push({
          type: effect.buffType as any,
          multiplier: effect.value ?? 1,
          turnsRemaining: effect.duration ?? 1,
          source: tile.name ?? `Tile ${tile.position}`,
        });
        ctx.appliedModifiers.push({
          name: `${tile.name} buff`,
          type: effect.buffType as any,
          value: effect.value ?? 0,
          source: 'tile',
        });
      } else if (effect.movementMultiplier && effect.buffDuration) {
        // Alternative buff format used in board-map
        ctx.player.buffs.push({
          type: 'movement' as any,
          multiplier: effect.movementMultiplier,
          turnsRemaining: effect.buffDuration,
          source: tile.name ?? `Tile ${tile.position}`,
        });
        ctx.appliedModifiers.push({
          name: effect.buffName ?? `${tile.name} buff`,
          type: 'movement' as any,
          value: effect.movementMultiplier,
          source: 'tile',
        });
      }
      break;
    }

    case 'stun': {
      ctx.player.stunTurns = effect.duration ?? effect.stunTurns ?? 1;
      ctx.result.isStunned = true;
      ctx.appliedModifiers.push({
        name: `${tile.name} stun`,
        type: 'stun' as any,
        value: effect.duration ?? effect.stunTurns ?? 1,
        source: 'tile',
      });
      break;
    }

    case 'view_reset': {
      ctx.player.currentView = 'Neutral';
      ctx.appliedModifiers.push({
        name: `${tile.name} view reset`,
        type: 'view_reset' as any,
        value: 0,
        source: 'tile',
      });
      break;
    }

    case 'teleport': {
      const dest = effect.destination ?? 1;
      ctx.result.newPosition = dest;
      ctx.player.position = dest;
      if (dest === 100) ctx.result.isGameWon = true;
      break;
    }

    case 'warp': {
      // Warp sub-effects (inside compound) - already handled by WARP_LOOKUP above
      // but if called from compound, apply it here too
      if (effect.warpTo) {
        ctx.result.newPosition = effect.warpTo;
        ctx.player.position = effect.warpTo;
        if (effect.warpTo === 100) ctx.result.isGameWon = true;
      }
      break;
    }

    default:
      break;
  }
}
