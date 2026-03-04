import { SubscriptionTier } from '../types/subscription';
import type { TierFeatures } from '../types/subscription';
import { TIER_DEFINITIONS } from '../constants/tiers';

// ─── Feature Flags ─────────────────────────────────────────

/**
 * Check if a tier has access to a specific feature.
 * In development, DEV_TIER_OVERRIDE can unlock all features.
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: keyof TierFeatures['features'],
  devTierOverride?: SubscriptionTier,
): boolean {
  const effectiveTier = devTierOverride ?? userTier;
  const features = TIER_DEFINITIONS[effectiveTier]?.features;
  if (!features) return false;

  const value = features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * Get the effective tier (accounting for dev override).
 */
export function getEffectiveTier(
  userTier: SubscriptionTier,
  devTierOverride?: string,
): SubscriptionTier {
  if (
    devTierOverride &&
    Object.values(SubscriptionTier).includes(devTierOverride as SubscriptionTier)
  ) {
    return devTierOverride as SubscriptionTier;
  }
  return userTier;
}

/**
 * Feature flag definitions — maps feature keys to required tier.
 */
export const FEATURE_TIER_REQUIREMENTS: Record<string, SubscriptionTier> = {
  basicBoard: SubscriptionTier.Apprentice,
  greekVisualizer: SubscriptionTier.MarketWarrior,
  dailyQuests: SubscriptionTier.MarketWarrior,
  vixAlerts: SubscriptionTier.MarketWarrior,
  privateLobbies: SubscriptionTier.MarketWarrior,
  realTimeQuestLogs: SubscriptionTier.BillionaireGuild,
  advancedAnalytics: SubscriptionTier.BillionaireGuild,
};
