// ─── Subscription Tiers ────────────────────────────────────
export enum SubscriptionTier {
  Apprentice = 'Apprentice',
  MarketWarrior = 'MarketWarrior',
  BillionaireGuild = 'BillionaireGuild',
}

export interface TierFeatures {
  tier: SubscriptionTier;
  label: string;
  description: string;
  monthlyPrice: number; // in INR, 0 = free
  features: {
    basicBoard: boolean;
    greekVisualizer: boolean;
    dailyQuests: boolean;
    realTimeQuestLogs: boolean;
    advancedAnalytics: boolean;
    vixAlerts: boolean;
    privateLobbies: boolean;
    maxGamesPerDay: number;
    botDifficulties: BotDifficultyAccess[];
  };
}

export type BotDifficultyAccess = 'conservative' | 'aggressive' | 'adaptive';

export type TierChannel = `tier:${Lowercase<SubscriptionTier>}`;
