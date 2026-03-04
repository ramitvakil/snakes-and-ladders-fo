import type { MarketView } from './player';

// ─── VIX ───────────────────────────────────────────────────
export type VIXRegime = 'calm' | 'normal' | 'elevated' | 'high' | 'extreme';

export interface VIXLevel {
  value: number;
  timestamp: number;
  regime: VIXRegime;
}

export type MarketTrend = MarketView; // Bullish | Bearish | Sideways | Neutral

// ─── Market Simulation Config ──────────────────────────────
export interface MarketSimulationConfig {
  /** Mean-reversion target for VIX (Ornstein-Uhlenbeck) */
  mean: number;
  /** Speed of mean reversion (higher = faster reversion) */
  kappa: number;
  /** Volatility of VIX itself */
  sigma: number;
  /** Min VIX value */
  min: number;
  /** Max VIX value */
  max: number;
  /** Tick interval in ms */
  tickIntervalMs: number;
  /** Random seed for reproducible demo mode (null = true random) */
  seed: string | null;
}

// ─── Daily Quests ──────────────────────────────────────────
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  reward: QuestReward;
  expiresAt: number; // epoch ms
  isCompleted: boolean;
  questType: QuestType;
}

export type QuestType =
  | 'survive_turns' // survive N turns without hitting a snake
  | 'reach_tile' // reach tile X with Y% capital
  | 'win_with_conviction' // win with conviction >= N
  | 'accumulate_capital' // end a turn with capital >= X%
  | 'match_views'; // correctly match market view N times in a row

export interface QuestReward {
  capitalBonus: number; // % capital added
  description: string;
}

// ─── Quest Log (BillionaireGuild real-time alerts) ─────────
export interface QuestLogEntry {
  id: string;
  timestamp: Date;
  type: 'trade_alert' | 'market_event' | 'quest_update';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

// ─── Market News Feed ──────────────────────────────────────
export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';
export type NewsCategory = 'equity' | 'derivative' | 'macro' | 'geopolitical' | 'rbi' | 'global' | 'sector';

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  sentiment: NewsSentiment;
  category: NewsCategory;
  timestamp: number; // epoch ms
  /** Optional short detail shown on expand */
  detail?: string;
}
