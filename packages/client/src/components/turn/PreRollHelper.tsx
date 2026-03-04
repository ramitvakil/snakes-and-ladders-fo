import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { MarketView, ConvictionLevel, VIXLevel } from '@game/shared';

interface PreRollHelperProps {
  selectedView: MarketView | null;
  conviction: ConvictionLevel | null;
  vixLevel: VIXLevel | null;
  capital: number;
  streak: number;
}

function getConvictionScalar(conviction: number): number {
  const clamped = Math.max(1, Math.min(5, Math.round(conviction)));
  return 1 + (clamped - 1) * 0.25;
}

export default function PreRollHelper({
  selectedView,
  conviction,
  vixLevel,
  capital,
  streak,
}: PreRollHelperProps) {
  const conv = conviction ?? 1;
  const scalar = getConvictionScalar(conv);
  const vix = vixLevel?.value ?? 15;
  const isHighVix = vix >= 25;

  let gammaMultiplier = 1;
  if (streak >= 2) gammaMultiplier = 2.0;
  else if (streak >= 1) gammaMultiplier = 1.5;

  const estimatedGain = 5 * scalar * gammaMultiplier;
  let estimatedLoss = 3 * scalar;
  if (isHighVix) {
    const vixMul = 1 + (vix - 25) * 0.02;
    estimatedLoss *= Math.max(1, vixMul);
  }

  const thetaCost = capital * 0.005;
  const netGain = estimatedGain - thetaCost;
  const netLoss = -(estimatedLoss + thetaCost);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 px-3 py-2.5 text-xs space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Forecast</span>
        <div className="flex items-center gap-1.5">
          {gammaMultiplier > 1 && (
            <span className="rounded-md bg-orange-900/40 text-orange-400 px-1.5 py-px text-[9px] font-bold">
              🔥 Γ {gammaMultiplier}×
            </span>
          )}
          {isHighVix && (
            <span className="rounded-md bg-red-900/40 text-red-400 px-1.5 py-px text-[9px] font-bold animate-pulse">
              ⚠ VEGA
            </span>
          )}
        </div>
      </div>

      {/* Theta + conviction row */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500">
          Θ -₹{thetaCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · Conv {scalar.toFixed(2)}×
        </span>
      </div>

      {/* Outcome cards */}
      <div className="grid grid-cols-2 gap-1.5">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-lg bg-emerald-950/30 border border-emerald-800/20 px-2 py-1.5 text-center"
        >
          <p className="text-[9px] text-emerald-400/60 uppercase font-semibold tracking-wider">Correct</p>
          <p className="text-sm font-bold tabular-nums text-emerald-400">
            +₹{netGain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-lg bg-red-950/30 border border-red-800/20 px-2 py-1.5 text-center"
        >
          <p className="text-[9px] text-red-400/60 uppercase font-semibold tracking-wider">Wrong</p>
          <p className="text-sm font-bold tabular-nums text-red-400">
            ₹{netLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </motion.div>
      </div>

      {/* VIX hint */}
      {selectedView && (
        <p className={clsx(
          'text-[10px] leading-tight pt-0.5 border-t border-gray-700/20',
          isHighVix ? 'text-red-400/70' : vix < 18 ? 'text-emerald-400/60' : 'text-gray-500',
        )}>
          {vix < 18 && '🟢 Low VIX — calm regime favors Bullish'}
          {vix >= 18 && vix <= 25 && '🟡 Normal VIX — balanced distribution'}
          {vix > 25 && `🔴 High VIX — wrong views cost ${((1 + (vix - 25) * 0.02) * 100 - 100).toFixed(0)}% extra`}
        </p>
      )}
    </motion.div>
  );
}
