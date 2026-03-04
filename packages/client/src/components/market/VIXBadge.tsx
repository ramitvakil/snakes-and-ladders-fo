import clsx from 'clsx';
import type { VIXLevel } from '@game/shared';

interface VIXBadgeProps {
  vixLevel: VIXLevel | null;
}

/**
 * Compact VIX warning badge for the turn controls area.
 * Only shows when VIX is above the vega threshold (25).
 */
export default function VIXBadge({ vixLevel }: VIXBadgeProps) {
  if (!vixLevel || vixLevel.value < 25) return null;

  const severity = vixLevel.value >= 40 ? 'extreme' : vixLevel.value >= 30 ? 'high' : 'elevated';

  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
        severity === 'extreme' && 'bg-red-900/40 border border-red-800/50 text-red-400 animate-pulse',
        severity === 'high' && 'bg-orange-900/40 border border-orange-800/50 text-orange-400',
        severity === 'elevated' && 'bg-yellow-900/30 border border-yellow-800/40 text-yellow-400',
      )}
    >
      <span>📉</span>
      <span>
        Vega Active — VIX {vixLevel.value.toFixed(1)}{' '}
        <span className="text-[10px] opacity-70">
          (wrong views cost {((1 + (vixLevel.value - 25) * 0.02) * 100 - 100).toFixed(0)}% extra)
        </span>
      </span>
    </div>
  );
}
