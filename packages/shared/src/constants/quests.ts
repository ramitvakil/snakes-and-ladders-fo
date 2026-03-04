import type { QuestType, QuestReward } from '../types/market';

// ─── Quest Templates ───────────────────────────────────────

export interface QuestTemplate {
  title: string;
  description: string;
  questType: QuestType;
  targetValue: number;
  reward: QuestReward;
  /** Duration in hours before expiry */
  durationHours: number;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    title: 'Snake Dodger',
    description: 'Survive 5 consecutive turns without landing on a snake.',
    questType: 'survive_turns',
    targetValue: 5,
    reward: { capitalBonus: 5, description: '+5% Capital bonus' },
    durationHours: 24,
  },
  {
    title: 'Capital Preserver',
    description: 'Reach tile 50 with more than 80% capital intact.',
    questType: 'reach_tile',
    targetValue: 50,
    reward: { capitalBonus: 8, description: '+8% Capital bonus' },
    durationHours: 24,
  },
  {
    title: 'Bold Conviction',
    description: 'Win a game with conviction level 3 or higher on your final turn.',
    questType: 'win_with_conviction',
    targetValue: 3,
    reward: { capitalBonus: 10, description: '+10% Capital bonus (next game)' },
    durationHours: 48,
  },
  {
    title: 'Bull Run',
    description: 'End 3 consecutive turns with capital above 90%.',
    questType: 'accumulate_capital',
    targetValue: 3,
    reward: { capitalBonus: 6, description: '+6% Capital bonus' },
    durationHours: 24,
  },
  {
    title: 'Oracle Vision',
    description: 'Correctly predict the market direction 3 times in a row.',
    questType: 'match_views',
    targetValue: 3,
    reward: { capitalBonus: 7, description: '+7% Capital bonus' },
    durationHours: 24,
  },
  {
    title: 'Marathon Trader',
    description: 'Survive 15 turns in a single game without being stunned.',
    questType: 'survive_turns',
    targetValue: 15,
    reward: { capitalBonus: 12, description: '+12% Capital bonus' },
    durationHours: 48,
  },
  {
    title: 'Risk Manager',
    description: 'Finish a game with capital above 70%.',
    questType: 'accumulate_capital',
    targetValue: 70,
    reward: { capitalBonus: 5, description: '+5% Capital bonus' },
    durationHours: 24,
  },
  {
    title: 'Speed Run',
    description: 'Reach tile 100 within 20 turns.',
    questType: 'reach_tile',
    targetValue: 100,
    reward: { capitalBonus: 15, description: '+15% Capital bonus (next game)' },
    durationHours: 48,
  },
];

// ─── Market Presets (for VIX Simulation) ───────────────────

import type { MarketSimulationConfig } from '../types/market';

export const MARKET_PRESETS: Record<string, MarketSimulationConfig> = {
  calm: {
    mean: 14,
    kappa: 0.3,
    sigma: 1.5,
    min: 10,
    max: 25,
    tickIntervalMs: 5000,
    seed: null,
  },
  normal: {
    mean: 18,
    kappa: 0.2,
    sigma: 2.5,
    min: 10,
    max: 40,
    tickIntervalMs: 5000,
    seed: null,
  },
  volatile: {
    mean: 28,
    kappa: 0.15,
    sigma: 4.0,
    min: 15,
    max: 50,
    tickIntervalMs: 3000,
    seed: null,
  },
  crash: {
    mean: 38,
    kappa: 0.1,
    sigma: 5.0,
    min: 25,
    max: 50,
    tickIntervalMs: 2000,
    seed: null,
  },
  demo: {
    mean: 18,
    kappa: 0.2,
    sigma: 2.5,
    min: 10,
    max: 40,
    tickIntervalMs: 5000,
    seed: 'demo-seed-2026', // deterministic for demo mode
  },
};
