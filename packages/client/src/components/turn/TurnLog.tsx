import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { TurnResult } from '@game/shared';
import { useGameStore } from '../../stores/gameStore';

export default function TurnLog() {
  const turnHistory = useGameStore((s) => s.turnHistory);
  const players = useGameStore((s) => s.players);
  const [expanded, setExpanded] = useState(true);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.displayName ?? 'Unknown';

  if (turnHistory.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-3">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">History</h3>
        <p className="mt-3 text-[11px] text-gray-600 text-center">No turns yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          History
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600 tabular-nums">{turnHistory.length} turns</span>
          <motion.span
            animate={{ rotate: expanded ? 0 : -90 }}
            className="text-[10px] text-gray-600"
          >
            ▾
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 max-h-52 space-y-0.5 overflow-y-auto">
              {[...turnHistory].reverse().map((turn, i) => (
                <TurnLogEntry
                  key={`${turn.turnNumber}-${turn.playerId}`}
                  turn={turn}
                  playerName={getPlayerName(turn.playerId)}
                  isLatest={i === 0}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TurnLogEntry({
  turn,
  playerName,
  isLatest,
}: {
  turn: TurnResult;
  playerName: string;
  isLatest: boolean;
}) {
  const isPositive = turn.capitalDelta >= 0;

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, x: -8 } : false}
      animate={{ opacity: 1, x: 0 }}
      className={clsx(
        'rounded-lg px-2 py-1.5 text-[10px]',
        isLatest ? 'bg-gray-800/70 border border-gray-600/30' : 'bg-transparent hover:bg-gray-800/30',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-gray-600 tabular-nums">T{turn.turnNumber}</span>
          <span className="text-gray-400 font-medium truncate">{playerName}</span>
          <span className="text-gray-600">🎲{turn.diceRoll}</span>
          <span className="text-gray-600">{turn.previousPosition}→{turn.newPosition}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={turn.viewMatched ? 'text-emerald-500' : 'text-red-500'}>
            {turn.viewMatched ? '✓' : '✗'}
          </span>
          <span className={clsx(
            'font-bold tabular-nums',
            isPositive ? 'text-emerald-400' : 'text-red-400',
          )}>
            {isPositive ? '+' : ''}₹{Math.abs(turn.capitalDelta).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Tags only if notable */}
      {(turn.tileEffect?.name || (turn.gammaMultiplier ?? 1) > 1 || turn.vixPenaltyApplied || turn.isStunned || turn.isMarginCall) && (
        <div className="flex items-center gap-1 mt-0.5">
          {turn.tileEffect?.name && (
            <span className="text-yellow-500/80">⚡{turn.tileName ?? 'Effect'}</span>
          )}
          {(turn.gammaMultiplier ?? 1) > 1 && <span className="text-orange-400">🔥γ</span>}
          {turn.vixPenaltyApplied && <span className="text-orange-400">📉ν</span>}
          {turn.isStunned && <span className="text-yellow-400">⚡Stun</span>}
          {turn.isMarginCall && <span className="text-red-400 font-bold">💀MC</span>}
        </div>
      )}
    </motion.div>
  );
}
