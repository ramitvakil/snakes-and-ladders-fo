import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import { useMarket } from '../hooks/useMarket';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useMarketStore } from '../stores/marketStore';
import { ConvictionLevel } from '@game/shared';

import BoardGrid from '../components/board/BoardGrid';
import DiceRoller from '../components/turn/DiceRoller';
import ViewSelector from '../components/turn/ViewSelector';
import ConvictionSlider from '../components/turn/ConvictionSlider';
import TurnResultOverlay from '../components/turn/TurnResultOverlay';
import PreRollHelper from '../components/turn/PreRollHelper';
import TurnLog from '../components/turn/TurnLog';
import GameSummary from '../components/turn/GameSummary';
import PlayerCard from '../components/player/PlayerCard';
import VIXMeter from '../components/market/VIXMeter';
import VIXBadge from '../components/market/VIXBadge';
import QuestPanel from '../components/market/QuestPanel';
import NewsTicker from '../components/market/NewsTicker';
import SentimentGauge from '../components/market/SentimentGauge';
import StockTicker from '../components/market/StockTicker';
import MarketIndicators from '../components/market/MarketIndicators';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { setView, setConviction, rollDice, isMyTurn, isRolling, status } = useGame(true);
  const { vixLevel, quests, newsItems } = useMarket(true);
  const vixHistory = useMarketStore((s) => s.vixHistory);

  const players = useGameStore((s) => s.players);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const selectedView = useGameStore((s) => s.selectedView);
  const selectedConviction = useGameStore((s) => s.selectedConviction);
  const lastTurnResult = useGameStore((s) => s.lastTurnResult);
  const myLastTurnResult = useGameStore((s) => s.myLastTurnResult);
  const turnHistory = useGameStore((s) => s.turnHistory);
  const winnerId = useGameStore((s) => s.winnerId);
  const userId = useAuthStore((s) => s.user?.id);

  // Compute my consecutive correct streak for PreRollHelper
  const myTurns = turnHistory.filter((t) => t.playerId === userId);
  let streak = 0;
  for (let i = myTurns.length - 1; i >= 0; i--) {
    const t = myTurns[i];
    if (!t) break;
    if (t.viewMatched) streak++;
    else break;
  }

  // Current player capital
  const myPlayer = players.find((p) => p.id === userId);
  const myCapital = myPlayer?.capital ?? 100;

  if (status === 'completed' && winnerId) {
    return (
      <GameSummary
        players={players}
        winnerId={winnerId}
        myPlayerId={userId ?? null}
        turnHistory={turnHistory}
        onPlayAgain={() => navigate('/lobby')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Stock Ticker Bar ── */}
      <div className="-mx-4 -mt-6">
        <StockTicker vixLevel={vixLevel} />
      </div>

      {/* ── Top Bar: Game ID + Turn + Market Indicators ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-emerald-400">S&L</span>
              <span className="text-gray-600 mx-1.5">•</span>
              <span className="text-gray-400 font-mono text-sm">#{gameId?.slice(0, 8)}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              key={currentTurn}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-lg bg-gray-800/60 border border-gray-700/30 px-3 py-1 text-xs font-mono text-gray-400"
            >
              Turn <span className="text-white font-bold">{currentTurn}</span>
            </motion.span>
          </div>
        </div>

        {/* Market Indicators Strip */}
        <MarketIndicators
          vixLevel={vixLevel}
          vixHistory={vixHistory}
          newsItems={newsItems}
          currentTurn={currentTurn}
        />
      </div>

      {/* ── Main Game Grid ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Left Column: Board + Controls */}
        <div className="space-y-4">
          {/* Board */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BoardGrid players={players} />
          </motion.div>

          {/* Turn Controls */}
          <AnimatePresence mode="wait">
            {isMyTurn && status === 'in_progress' && (
              <motion.div
                key="turn-controls"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* VIX Impact Badge */}
                <VIXBadge vixLevel={vixLevel} />

                {/* Pre-Roll Decision Helper */}
                <PreRollHelper
                  selectedView={selectedView}
                  conviction={selectedConviction}
                  vixLevel={vixLevel}
                  capital={myCapital}
                  streak={streak}
                />

                {/* Control Card */}
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-sm font-bold text-emerald-400 tracking-tight">Your Turn</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <ViewSelector selected={selectedView} onChange={setView} />
                    <ConvictionSlider value={selectedConviction ?? ConvictionLevel.Min} onChange={setConviction} />
                    <DiceRoller onRoll={rollDice} isRolling={isRolling} disabled={!selectedView} />
                  </div>
                </div>
              </motion.div>
            )}

            {!isMyTurn && status === 'in_progress' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-gray-600 border-t-emerald-400"
                  />
                  <span className="text-sm text-gray-400">Opponent is thinking…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Turn Result Overlay — always show YOUR last result */}
          <AnimatePresence>
            {myLastTurnResult && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <TurnResultOverlay result={myLastTurnResult} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact opponent last-move summary */}
          <AnimatePresence>
            {lastTurnResult && lastTurnResult.playerId !== userId && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm"
              >
                <span className="text-gray-500">🤖</span>
                <span className="text-gray-400">
                  Opponent rolled{' '}
                  <span className="font-bold text-white">{lastTurnResult.diceRoll}</span>
                </span>
                <span className="text-gray-600">→</span>
                <span className="text-gray-400">Tile {lastTurnResult.newPosition}</span>
                <span className="ml-auto font-mono font-semibold">
                  <span className={lastTurnResult.capitalDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {lastTurnResult.capitalDelta >= 0 ? '+' : ''}₹
                    {Math.abs(lastTurnResult.capitalDelta).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="space-y-3">
          {/* VIX */}
          <VIXMeter vixLevel={vixLevel} />

          {/* News Sentiment Gauge */}
          <SentimentGauge newsItems={newsItems} />

          {/* Quests */}
          <QuestPanel quests={quests} />

          {/* Market News Feed */}
          <NewsTicker items={newsItems} />

          {/* Turn History Log */}
          <TurnLog />

          {/* Players */}
          <div className="glass-card rounded-xl p-3">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Players</h3>
            <div className="space-y-2">
              {players.map((p) => {
                const currentPlayerId = useGameStore.getState().currentPlayerId;
                const isCurrent = currentPlayerId ? p.id === currentPlayerId : false;
                return (
                  <PlayerCard key={p.id} player={p} isCurrentTurn={isCurrent} />
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
