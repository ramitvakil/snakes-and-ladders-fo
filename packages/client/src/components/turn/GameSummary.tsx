import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Player, TurnResult } from '@game/shared';
import CapitalSparkline from '../player/CapitalSparkline';

interface GameSummaryProps {
  players: Player[];
  winnerId: string | null;
  myPlayerId: string | null;
  turnHistory: TurnResult[];
  onPlayAgain?: () => void;
}

export default function GameSummary({
  players,
  winnerId,
  myPlayerId,
  turnHistory,
  onPlayAgain,
}: GameSummaryProps) {
  const winner = players.find((p) => p.id === winnerId);
  const isMyWin = winnerId === myPlayerId;

  // Sort players by final capital for rankings
  const ranked = [...players].sort((a, b) => b.capital - a.capital);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-emerald-400">
          {isMyWin ? '🏆 Victory!' : '🏁 Game Over'}
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          {winner?.displayName ?? 'Someone'} {isMyWin ? 'you won!' : 'wins the game!'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {turnHistory.length} turns played
        </p>
      </motion.div>

      {/* Player Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-4"
      >
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Final Standings</h2>
        <div className="space-y-3">
          {ranked.map((player, i) => {
            const playerTurns = turnHistory.filter((t) => t.playerId === player.id);
            const capitalHistory = playerTurns.map((t) => t.finalCapital);
            const correctViews = playerTurns.filter((t) => t.viewMatched).length;
            const totalTurns = playerTurns.length;
            const accuracy = totalTurns > 0 ? ((correctViews / totalTurns) * 100).toFixed(0) : '0';

            return (
              <div
                key={player.id}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2',
                  i === 0 ? 'bg-emerald-900/20 border border-emerald-800/30' :
                  'bg-gray-800/30',
                )}
              >
                {/* Rank */}
                <span className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold flex-shrink-0',
                  i === 0 ? 'bg-yellow-500 text-gray-900' :
                  i === 1 ? 'bg-gray-400 text-gray-900' :
                  i === 2 ? 'bg-amber-700 text-white' :
                  'bg-gray-700 text-gray-400',
                )}>
                  {i + 1}
                </span>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">
                      {player.displayName}
                      {player.id === myPlayerId && (
                        <span className="ml-1 text-xs text-cyan-400">(you)</span>
                      )}
                      {player.isBot && <span className="ml-1 text-xs">🤖</span>}
                    </span>
                    {player.id === winnerId && (
                      <span className="text-xs text-yellow-400">👑</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                    <span>Tile {player.position}</span>
                    <span>{accuracy}% accuracy</span>
                    <span>{totalTurns} turns</span>
                  </div>
                </div>

                {/* Sparkline */}
                {capitalHistory.length >= 2 && (
                  <CapitalSparkline data={capitalHistory} width={80} height={22} />
                )}

                {/* Capital */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">
                    ₹{player.capital.toLocaleString('en-IN')}
                  </p>
                  {player.isMarginCalled && (
                    <p className="text-[10px] text-red-400">Margin Called</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Key Moments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-4"
      >
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Key Moments</h2>
        <div className="space-y-2">
          {getKeyMoments(turnHistory, players).map((moment, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="flex-shrink-0">{moment.icon}</span>
              <span className="text-gray-300">{moment.text}</span>
              <span className="ml-auto flex-shrink-0 font-mono text-gray-500">T{moment.turn}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* My Stats (if I played) */}
      {myPlayerId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-4"
        >
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Your Performance</h2>
          <MyStats turnHistory={turnHistory} myPlayerId={myPlayerId} />
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
          >
            Play Again
          </button>
        )}
        <a
          href="/leaderboard"
          className="rounded-lg bg-gray-800 px-6 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 transition"
        >
          Leaderboard
        </a>
        <a
          href="/"
          className="rounded-lg bg-gray-800 px-6 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 transition"
        >
          Home
        </a>
      </div>
    </div>
  );
}

// ── Key Moments Extraction ──

interface KeyMoment {
  icon: string;
  text: string;
  turn: number;
}

function getKeyMoments(history: TurnResult[], players: Player[]): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const getName = (id: string) => players.find((p) => p.id === id)?.displayName ?? 'Player';

  // Biggest single gain
  const biggestGain = history.reduce(
    (best, t) => (t.capitalDelta > (best?.capitalDelta ?? -Infinity) ? t : best),
    null as TurnResult | null,
  );
  if (biggestGain && biggestGain.capitalDelta > 0) {
    moments.push({
      icon: '📈',
      text: `${getName(biggestGain.playerId)} gained ₹${biggestGain.capitalDelta.toFixed(0)} — biggest win`,
      turn: biggestGain.turnNumber,
    });
  }

  // Biggest single loss
  const biggestLoss = history.reduce(
    (worst, t) => (t.capitalDelta < (worst?.capitalDelta ?? Infinity) ? t : worst),
    null as TurnResult | null,
  );
  if (biggestLoss && biggestLoss.capitalDelta < 0) {
    moments.push({
      icon: '📉',
      text: `${getName(biggestLoss.playerId)} lost ₹${Math.abs(biggestLoss.capitalDelta).toFixed(0)} — worst hit`,
      turn: biggestLoss.turnNumber,
    });
  }

  // Margin calls
  history.filter((t) => t.isMarginCall).forEach((t) => {
    moments.push({
      icon: '💀',
      text: `${getName(t.playerId)} got margin called`,
      turn: t.turnNumber,
    });
  });

  // Game-winning move
  const winTurn = history.find((t) => t.isGameWon);
  if (winTurn) {
    moments.push({
      icon: '🏆',
      text: `${getName(winTurn.playerId)} reached tile 100`,
      turn: winTurn.turnNumber,
    });
  }

  // Longest correct streak
  let maxStreak = 0;
  let maxStreakPlayer = '';
  for (const player of players) {
    const turns = history.filter((t) => t.playerId === player.id);
    let streak = 0;
    for (const t of turns) {
      if (t.viewMatched) {
        streak++;
        if (streak > maxStreak) {
          maxStreak = streak;
          maxStreakPlayer = player.displayName;
        }
      } else {
        streak = 0;
      }
    }
  }
  if (maxStreak >= 3) {
    moments.push({
      icon: '🔥',
      text: `${maxStreakPlayer} had a ${maxStreak}-turn winning streak`,
      turn: 0,
    });
  }

  return moments.sort((a, b) => a.turn - b.turn).slice(0, 6);
}

// ── My Stats Component ──

function MyStats({ turnHistory, myPlayerId }: { turnHistory: TurnResult[]; myPlayerId: string }) {
  const myTurns = turnHistory.filter((t) => t.playerId === myPlayerId);
  if (myTurns.length === 0) {
    return <p className="text-xs text-gray-500">No turns recorded</p>;
  }

  const correctViews = myTurns.filter((t) => t.viewMatched).length;
  const totalGain = myTurns.filter((t) => t.capitalDelta > 0).reduce((s, t) => s + t.capitalDelta, 0);
  const totalLoss = myTurns.filter((t) => t.capitalDelta < 0).reduce((s, t) => s + Math.abs(t.capitalDelta), 0);
  const avgDelta = myTurns.reduce((s, t) => s + t.capitalDelta, 0) / myTurns.length;
  const gammaActive = myTurns.filter((t) => (t.gammaMultiplier ?? 1) > 1).length;
  const vegaHits = myTurns.filter((t) => t.vixPenaltyApplied).length;

  const stats = [
    { label: 'Turns Played', value: myTurns.length.toString(), color: 'text-gray-300' },
    { label: 'View Accuracy', value: `${((correctViews / myTurns.length) * 100).toFixed(0)}%`, color: correctViews > myTurns.length / 2 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Total Gained', value: `₹${totalGain.toFixed(0)}`, color: 'text-emerald-400' },
    { label: 'Total Lost', value: `₹${totalLoss.toFixed(0)}`, color: 'text-red-400' },
    { label: 'Avg P&L/Turn', value: `${avgDelta >= 0 ? '+' : ''}₹${avgDelta.toFixed(1)}`, color: avgDelta >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Gamma Boosts', value: gammaActive.toString(), color: 'text-orange-400' },
    { label: 'Vega Hits', value: vegaHits.toString(), color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className={clsx('text-lg font-bold', stat.color)}>{stat.value}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
