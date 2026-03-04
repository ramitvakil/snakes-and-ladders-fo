import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import type { TurnResult } from '@game/shared';

interface TurnResultOverlayProps {
  result: TurnResult;
}

/* ── Waterfall row helper ── */
function WaterfallRow({
  label,
  icon,
  value,
  explanation,
  delay = 0,
}: {
  label: string;
  icon: string;
  value: number;
  explanation: string;
  delay?: number;
}) {
  const formatted = `${value >= 0 ? '+' : ''}₹${Math.abs(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center justify-between gap-2 rounded-lg bg-gray-800/40 px-3 py-1.5 text-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-gray-300 truncate">{label}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={clsx('font-mono font-semibold', value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-gray-400')}>
          {formatted}
        </span>
        <p className="text-[10px] text-gray-500 max-w-[160px] truncate">{explanation}</p>
      </div>
    </motion.div>
  );
}

export default function TurnResultOverlay({ result }: TurnResultOverlayProps) {
  const [showDetails, setShowDetails] = useState(true);
  const capitalDelta = result.capitalDelta;
  const isPositive = capitalDelta >= 0;

  // ── Build waterfall steps from turn result data ──
  const steps: { label: string; icon: string; value: number; explanation: string }[] = [];

  // 1. Theta decay (always applied)
  if (result.thetaApplied) {
    const thetaMod = result.appliedModifiers?.find((m) => m.type === 'theta');
    const thetaVal = thetaMod?.value ?? -(result.previousCapital * 0.005);
    steps.push({
      label: 'Theta Decay',
      icon: '⏰',
      value: Number(thetaVal.toFixed(2)),
      explanation: '0.5% time-decay per turn',
    });
  }

  // 2. Tile effect
  if (result.tileEffect && result.tileName) {
    const tileDelta = result.tileEffect.capitalDelta ?? result.tileEffect.value ?? 0;
    if (tileDelta !== 0) {
      steps.push({
        label: result.tileName,
        icon: '⚡',
        value: tileDelta,
        explanation: `Tile ${result.newPosition} effect`,
      });
    }
  }

  // 3. View match / mismatch conviction gain/loss
  const convScalar = 1 + (Math.max(1, Math.min(5, result.convictionMultiplier)) - 1) * 0.25;
  if (result.viewMatched) {
    const baseGain = 5 * convScalar * (result.gammaMultiplier ?? 1);
    steps.push({
      label: 'View Correct',
      icon: '✅',
      value: baseGain,
      explanation: `${result.declaredView} = ${result.marketOutcome} × ${convScalar.toFixed(2)}x conv`,
    });
  } else {
    let baseLoss = -3 * convScalar;
    // VIX amplification
    if (result.vixPenaltyApplied && result.vixLevel > 25) {
      const vixMul = 1 + (result.vixLevel - 25) * 0.02;
      baseLoss *= Math.max(1, vixMul);
    }
    steps.push({
      label: 'View Wrong',
      icon: '❌',
      value: Number(baseLoss.toFixed(2)),
      explanation: `${result.declaredView} ≠ ${result.marketOutcome} × ${convScalar.toFixed(2)}x conv`,
    });
  }

  // 4. Gamma bonus (if active)
  if ((result.gammaMultiplier ?? 1) > 1) {
    steps.push({
      label: 'Gamma Boost',
      icon: '🔥',
      value: 0, // Already included in view gain above
      explanation: `${result.gammaMultiplier}x multiplier (consecutive correct)`,
    });
  }

  // 5. Vega penalty (if applied)
  if (result.vixPenaltyApplied) {
    steps.push({
      label: 'Vega Penalty',
      icon: '📉',
      value: 0, // Already included in view loss above
      explanation: `VIX ${result.vixLevel.toFixed(1)} > 25 threshold`,
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-card rounded-xl p-4"
      >
        {/* Header: Dice + Movement + Net result */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎲</span>
              <span className="text-2xl font-bold text-white">{result.diceRoll}</span>
            </div>
            <div className="text-sm text-gray-400">
              Tile {result.previousPosition} → <span className="font-bold text-emerald-400">{result.newPosition}</span>
              {result.spacesMovedRaw !== result.diceRoll && (
                <span className="ml-1 text-xs text-gray-500">({result.spacesMovedRaw} spaces)</span>
              )}
            </div>
          </div>
          <motion.div
            key={result.finalCapital}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className="text-right"
          >
            <p className={clsx('text-xl font-bold', isPositive ? 'text-emerald-400' : 'text-red-400')}>
              {isPositive ? '+' : ''}₹{Math.abs(capitalDelta).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">₹{result.finalCapital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </motion.div>
        </div>

        {/* View match badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={clsx(
            'rounded-full px-3 py-0.5 text-xs font-semibold',
            result.viewMatched ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
          )}>
            {result.viewMatched ? '✓ View Matched' : '✗ View Wrong'}
          </span>
          <span className="text-xs text-gray-500">
            You: {result.declaredView} | Market: {result.marketOutcome}
          </span>
          {result.vixLevel > 0 && (
            <span className={clsx(
              'ml-auto rounded px-2 py-0.5 text-[10px] font-mono',
              result.vixLevel > 25 ? 'bg-orange-900/40 text-orange-400' : 'bg-gray-800 text-gray-500'
            )}>
              VIX {result.vixLevel.toFixed(1)}
            </span>
          )}
        </div>

        {/* Toggle waterfall details */}
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="mb-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
        >
          {showDetails ? '▾ Hide P&L Breakdown' : '▸ Show P&L Breakdown'}
        </button>

        {/* Waterfall P&L steps */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-1 overflow-hidden"
            >
              {steps.map((step, i) => (
                <WaterfallRow key={step.label} {...step} delay={i * 0.08} />
              ))}
              {/* Separator + Total */}
              <div className="my-1 border-t border-gray-700" />
              <div className="flex items-center justify-between px-3 py-1 text-sm font-semibold">
                <span className="text-gray-300">Net P&L</span>
                <span className={clsx('font-mono', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                  {isPositive ? '+' : ''}₹{Math.abs(capitalDelta).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modifier badges */}
        {result.appliedModifiers && result.appliedModifiers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {result.appliedModifiers.map((m, i) => (
              <span key={i} className={clsx(
                'rounded px-2 py-0.5 text-xs',
                m.type === 'theta' ? 'bg-gray-800 text-gray-400' :
                m.type === 'gamma' ? 'bg-emerald-900/40 text-emerald-400' :
                m.type === 'vega' ? 'bg-orange-900/40 text-orange-400' :
                'bg-gray-800 text-gray-400'
              )}>
                {m.name}{m.value !== 0 && m.type !== 'theta' ? ` ×${m.value}` : ''}
              </span>
            ))}
          </div>
        )}

        {/* Margin Call / Stun */}
        {result.isMarginCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 rounded-lg bg-red-900/30 border border-red-800 px-4 py-2 text-center"
          >
            <p className="text-sm font-bold text-red-400">⚠️ MARGIN CALL</p>
            <p className="text-xs text-red-300/70">Capital depleted — you're out!</p>
          </motion.div>
        )}
        {result.isStunned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 rounded-lg bg-yellow-900/20 border border-yellow-800/50 px-3 py-1.5 text-center"
          >
            <p className="text-xs text-yellow-400">⚡ Stunned for 2 turns — large single-turn loss</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
