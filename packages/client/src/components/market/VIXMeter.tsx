import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { VIXLevel } from '@game/shared';

interface VIXMeterProps {
  vixLevel: VIXLevel | null;
}

const regimeConfig: Record<string, { color: string; barColor: string; glow: string; label: string }> = {
  calm: { color: 'text-emerald-400', barColor: 'bg-emerald-400', glow: 'shadow-emerald-500/20', label: 'CALM' },
  normal: { color: 'text-cyan-400', barColor: 'bg-cyan-400', glow: 'shadow-cyan-500/20', label: 'NORMAL' },
  elevated: { color: 'text-yellow-400', barColor: 'bg-yellow-400', glow: 'shadow-yellow-500/20', label: 'ELEVATED' },
  high: { color: 'text-orange-400', barColor: 'bg-orange-400', glow: 'shadow-orange-500/20', label: 'HIGH' },
  extreme: { color: 'text-red-500', barColor: 'bg-red-500', glow: 'shadow-red-500/30', label: 'EXTREME' },
};

export default function VIXMeter({ vixLevel }: VIXMeterProps) {
  if (!vixLevel) {
    return (
      <div className="glass-card rounded-xl p-4 shimmer">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-700 animate-pulse" />
          <p className="text-xs text-gray-600">VIX Connecting…</p>
        </div>
      </div>
    );
  }

  const config = regimeConfig[vixLevel.regime] ?? regimeConfig.normal!;
  const pct = Math.min(100, (vixLevel.value / 80) * 100);

  return (
    <div className="glass-card rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className={clsx('h-1.5 w-1.5 rounded-full', config.barColor, vixLevel.regime === 'extreme' && 'animate-pulse')} />
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">India VIX</p>
        </div>
        <motion.span
          key={vixLevel.regime}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={clsx(
            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
            config.color,
            vixLevel.regime === 'extreme' ? 'bg-red-900/30 animate-pulse' :
            vixLevel.regime === 'high' ? 'bg-orange-900/30' :
            'bg-gray-800/50',
          )}
        >
          {config.label}
        </motion.span>
      </div>

      {/* Value */}
      <motion.p
        key={Math.floor(vixLevel.value)}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className={clsx('text-3xl font-black font-mono tracking-tighter', config.color)}
      >
        {vixLevel.value.toFixed(1)}
      </motion.p>

      {/* Bar */}
      <div className="mt-2.5 h-1.5 rounded-full bg-gray-800/80 overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', config.barColor)}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ boxShadow: `0 0 8px ${config.glow}` }}
        />
      </div>

      {/* Scale labels */}
      <div className="mt-1 flex justify-between text-[9px] text-gray-600 font-mono">
        <span>0</span>
        <span className="text-emerald-800">15</span>
        <span className="text-yellow-800">25</span>
        <span className="text-orange-800">40</span>
        <span className="text-red-800">55</span>
        <span>80</span>
      </div>

      {/* Impact hint */}
      {vixLevel.value >= 25 && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-[10px] text-orange-400/70 leading-snug border-t border-gray-700/30 pt-2"
        >
          ⚠ Vega active — wrong views amplified by {((1 + (vixLevel.value - 25) * 0.02) * 100 - 100).toFixed(0)}%
        </motion.p>
      )}
    </div>
  );
}
