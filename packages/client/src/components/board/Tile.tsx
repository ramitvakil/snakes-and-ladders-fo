import clsx from 'clsx';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { TileType, type TileDefinition, type WarpEdge } from '@game/shared';

interface TileProps {
  number: number;
  definition?: TileDefinition;
  warp?: WarpEdge;
  children?: ReactNode;
}

/**
 * Generates a human-readable description of a tile's effect.
 */
function describeEffect(def?: TileDefinition): string | null {
  if (!def?.effect || def.effect.type === 'none') return null;
  const e = def.effect;
  switch (e.type) {
    case 'warp':
      return `Warps you to tile ${e.warpTo}`;
    case 'capital_percent':
    case 'capital_change':
      return e.capitalDelta != null
        ? `${e.capitalDelta > 0 ? '+' : ''}${e.capitalDelta}% capital`
        : null;
    case 'capital_flat':
      return e.value != null
        ? `${e.value > 0 ? '+' : ''}₹${Math.abs(e.value)} flat`
        : null;
    case 'buff':
      return `Buff: ${e.buffName ?? e.name ?? 'boost'} for ${e.buffDuration ?? e.duration ?? '?'} turns`;
    case 'debuff':
      return `Debuff: ${e.buffName ?? e.name ?? 'penalty'} for ${e.buffDuration ?? e.duration ?? '?'} turns`;
    case 'stun':
      return `Stunned for ${e.stunTurns ?? 2} turns`;
    case 'teleport':
      return `Teleport to tile ${e.destination}`;
    case 'view_reset':
      return 'Resets your market view to null';
    case 'compound':
      return 'Multiple effects combined';
    default:
      return e.name ?? null;
  }
}

export default function Tile({ number: num, definition, warp, children }: TileProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isStart = num === 1;
  const isFinish = num === 100;

  const tileClass = clsx(
    'tile relative flex flex-col items-center justify-center text-[10px] leading-tight',
    {
      'tile-start': isStart,
      'tile-finish': isFinish,
      'tile-ladder': warp?.type === 'ladder',
      'tile-snake': warp?.type === 'snake',
      'tile-event': definition?.type === TileType.Event,
      'tile-normal': !isStart && !isFinish && !warp && definition?.type !== TileType.Event,
    },
  );

  const effectDesc = describeEffect(definition);
  const hasTooltipContent = definition?.name || definition?.flavor || effectDesc || warp;

  return (
    <div
      className={tileClass}
      onMouseEnter={() => hasTooltipContent && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="font-mono text-[9px] text-gray-500">{num}</span>
      {warp && (
        <span className={clsx('text-[8px] font-bold', warp.type === 'ladder' ? 'text-green-300' : 'text-red-300')}>
          {warp.type === 'ladder' ? `↑${warp.to}` : `↓${warp.to}`}
        </span>
      )}
      {definition?.name && !warp && (
        <span className="max-w-full truncate text-[7px] text-gray-400">{definition.name}</span>
      )}
      {/* Player tokens */}
      {children && <div className="absolute bottom-0 flex gap-0.5">{children}</div>}

      {/* Rich tooltip */}
      {showTooltip && hasTooltipContent && (
        <div className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 pointer-events-none">
          <div className="min-w-[160px] max-w-[220px] rounded-lg bg-gray-900 border border-gray-700 shadow-xl px-3 py-2 text-left">
            {/* Tile name */}
            <p className="text-xs font-semibold text-white truncate">
              {definition?.name ?? `Tile ${num}`}
            </p>
            {/* Warp info */}
            {warp && (
              <p className={clsx('text-[10px] mt-0.5', warp.type === 'ladder' ? 'text-green-400' : 'text-red-400')}>
                {warp.type === 'ladder' ? '🪜' : '🐍'} {warp.name}: → Tile {warp.to}
              </p>
            )}
            {/* Flavor text */}
            {definition?.flavor && (
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">{definition.flavor}</p>
            )}
            {/* Effect description */}
            {effectDesc && (
              <p className={clsx(
                'text-[10px] mt-1 font-medium',
                definition?.effect?.capitalDelta != null && definition.effect.capitalDelta > 0
                  ? 'text-emerald-400'
                  : definition?.effect?.capitalDelta != null && definition.effect.capitalDelta < 0
                    ? 'text-red-400'
                    : 'text-cyan-400',
              )}>
                ⚡ {effectDesc}
              </p>
            )}
            {/* Tile type badge */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={clsx(
                'rounded px-1.5 py-0.5 text-[9px] font-medium',
                definition?.type === TileType.Event ? 'bg-yellow-900/40 text-yellow-400' :
                definition?.type === TileType.Snake ? 'bg-red-900/40 text-red-400' :
                definition?.type === TileType.Ladder ? 'bg-green-900/40 text-green-400' :
                'bg-gray-800 text-gray-500',
              )}>
                {definition?.type ?? 'Neutral'}
              </span>
              <span className="text-[9px] text-gray-600">#{num}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
