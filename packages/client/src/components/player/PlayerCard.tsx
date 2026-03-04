import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Player } from '@game/shared';
import CapitalSparkline from './CapitalSparkline';
import { useGameStore } from '../../stores/gameStore';

const PLAYER_THEMES = [
  { border: 'border-cyan-500', glow: 'shadow-cyan-500/15', dot: 'bg-cyan-400', tag: 'text-cyan-400' },
  { border: 'border-violet-500', glow: 'shadow-violet-500/15', dot: 'bg-violet-400', tag: 'text-violet-400' },
  { border: 'border-amber-500', glow: 'shadow-amber-500/15', dot: 'bg-amber-400', tag: 'text-amber-400' },
  { border: 'border-rose-500', glow: 'shadow-rose-500/15', dot: 'bg-rose-400', tag: 'text-rose-400' },
];

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
}

export default function PlayerCard({ player, isCurrentTurn }: PlayerCardProps) {
  const theme = PLAYER_THEMES[player.turnOrder % PLAYER_THEMES.length]!;
  const turnHistory = useGameStore((s) => s.turnHistory);

  const capitalHistory = turnHistory
    .filter((t) => t.playerId === player.id)
    .map((t) => t.finalCapital);

  // Compute streak
  const playerTurns = turnHistory.filter((t) => t.playerId === player.id);
  let streak = 0;
  let streakType: 'correct' | 'wrong' | null = null;
  for (let i = playerTurns.length - 1; i >= 0; i--) {
    const turn = playerTurns[i];
    if (!turn) break;
    const matched = turn.viewMatched;
    if (streakType === null) {
      streakType = matched ? 'correct' : 'wrong';
      streak = 1;
    } else if ((matched && streakType === 'correct') || (!matched && streakType === 'wrong')) {
      streak++;
    } else {
      break;
    }
  }

  const pnl = player.capital - 10000;
  const pnlColor = pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-xl border-l-4 bg-gray-800/60 backdrop-blur-sm px-3 py-2.5 transition-all duration-300',
        theme.border,
        isCurrentTurn && `ring-1 ring-emerald-500/30 ${theme.glow} shadow-md`,
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={clsx('h-2 w-2 rounded-full', theme.dot, isCurrentTurn && 'animate-pulse')} />
          <span className="text-sm font-bold text-white tracking-tight">
            {player.displayName}
          </span>
          {player.isBot && <span className="text-[10px] text-gray-500">🤖</span>}
        </div>
        <div className="flex items-center gap-2">
          {isCurrentTurn && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400"
            >
              PLAYING
            </motion.span>
          )}
          <span className="text-[11px] font-medium text-gray-500">📍 {player.position}</span>
        </div>
      </div>

      {/* Capital row */}
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-sm font-bold text-white tabular-nums">
          ₹{player.capital.toLocaleString('en-IN')}
        </span>
        <span className={clsx('text-[11px] font-semibold tabular-nums', pnlColor)}>
          {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Sparkline */}
      {capitalHistory.length >= 2 && (
        <div className="mt-1.5 -mx-1">
          <CapitalSparkline data={capitalHistory} width={160} height={26} />
        </div>
      )}

      {/* Tags row */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {/* View & conviction */}
        {player.currentView && (
          <span className="rounded-md bg-gray-700/60 px-1.5 py-0.5 text-[10px] text-gray-300">
            {player.currentView === 'Bullish' ? '🐂' : player.currentView === 'Bearish' ? '🐻' : '⚖️'}{' '}
            Conv {player.conviction}
          </span>
        )}

        {/* Streak */}
        {streak >= 2 && streakType && (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={clsx(
              'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
              streakType === 'correct'
                ? 'bg-emerald-900/40 text-emerald-400'
                : 'bg-red-900/40 text-red-400',
            )}
          >
            {streakType === 'correct' ? `🔥 ${streak}` : `❄️ ${streak}`}
          </motion.span>
        )}

        {/* Buffs */}
        {player.buffs?.map((b, i) => (
          <span key={i} className="rounded-md bg-violet-900/40 px-1.5 py-0.5 text-[10px] text-violet-300">
            {b.type} ×{b.multiplier}
          </span>
        ))}

        {/* Status */}
        {player.isMarginCalled && (
          <span className="rounded-md bg-red-900/40 px-1.5 py-0.5 text-[10px] font-bold text-red-400 animate-pulse">
            MARGIN CALL
          </span>
        )}
        {player.stunTurns > 0 && (
          <span className="rounded-md bg-yellow-900/40 px-1.5 py-0.5 text-[10px] text-yellow-400">
            Stunned {player.stunTurns}t
          </span>
        )}
      </div>
    </motion.div>
  );
}
