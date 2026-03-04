import { SubscriptionTier } from '../types/subscription';
import type { TierFeatures } from '../types/subscription';

// ─── Tier Definitions ──────────────────────────────────────

export const TIER_DEFINITIONS: Record<SubscriptionTier, TierFeatures> = {
  [SubscriptionTier.Apprentice]: {
    tier: SubscriptionTier.Apprentice,
    label: 'Apprentice',
    description: 'Start your market journey. Learn the basics of Snakes & Ladders F&O.',
    monthlyPrice: 0,
    features: {
      basicBoard: true,
      greekVisualizer: false,
      dailyQuests: false,
      realTimeQuestLogs: false,
      advancedAnalytics: false,
      vixAlerts: false,
      privateLobbies: false,
      maxGamesPerDay: 5,
      botDifficulties: ['conservative'],
    },
  },

  [SubscriptionTier.MarketWarrior]: {
    tier: SubscriptionTier.MarketWarrior,
    label: 'Market Warrior',
    description: 'Level up with daily challenges and the Greek modifier visualizer.',
    monthlyPrice: 299,
    features: {
      basicBoard: true,
      greekVisualizer: true,
      dailyQuests: true,
      realTimeQuestLogs: false,
      advancedAnalytics: false,
      vixAlerts: true,
      privateLobbies: true,
      maxGamesPerDay: 20,
      botDifficulties: ['conservative', 'aggressive'],
    },
  },

  [SubscriptionTier.BillionaireGuild]: {
    tier: SubscriptionTier.BillionaireGuild,
    label: 'Billionaire Guild',
    description:
      'The ultimate trader. Real-time quest logs, advanced analytics, and unlimited games.',
    monthlyPrice: 999,
    features: {
      basicBoard: true,
      greekVisualizer: true,
      dailyQuests: true,
      realTimeQuestLogs: true,
      advancedAnalytics: true,
      vixAlerts: true,
      privateLobbies: true,
      maxGamesPerDay: Infinity,
      botDifficulties: ['conservative', 'aggressive', 'adaptive'],
    },
  },
};

// ─── Helpers ───────────────────────────────────────────────

export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return TIER_DEFINITIONS[tier];
}

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof TierFeatures['features'],
): boolean {
  const features = TIER_DEFINITIONS[tier].features;
  const value = features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

export function tierMeetsMinimum(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier,
): boolean {
  const tierOrder: SubscriptionTier[] = [
    SubscriptionTier.Apprentice,
    SubscriptionTier.MarketWarrior,
    SubscriptionTier.BillionaireGuild,
  ];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}
