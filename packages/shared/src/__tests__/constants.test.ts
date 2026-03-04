import { describe, it, expect } from 'vitest';
import {
  DEFAULT_BOARD_MAP,
  TILE_LOOKUP,
  WARP_LOOKUP,
  TIER_DEFINITIONS,
  QUEST_TEMPLATES,
  MARKET_PRESETS,
  DEFAULT_GREEK_CONFIG,
  getConvictionScalar,
  rollDice,
  generateMarketOutcome,
  hasFeatureAccess,
  SubscriptionTier,
} from '@game/shared';

describe('board-map constants', () => {
  it('defines exactly 100 tiles', () => {
    expect(DEFAULT_BOARD_MAP.tiles).toHaveLength(100);
  });

  it('has warp edges (snakes & ladders)', () => {
    expect(DEFAULT_BOARD_MAP.warps.length).toBeGreaterThan(0);
    const snakes = DEFAULT_BOARD_MAP.warps.filter((w) => w.type === 'snake');
    const ladders = DEFAULT_BOARD_MAP.warps.filter((w) => w.type === 'ladder');
    expect(snakes.length).toBeGreaterThan(0);
    expect(ladders.length).toBeGreaterThan(0);
  });

  it('TILE_LOOKUP covers event tiles', () => {
    // We know tile 51 is "Earnings Surprise"
    const tile51 = TILE_LOOKUP.get(51);
    expect(tile51).toBeDefined();
    expect(tile51?.name).toBe('Earnings Surprise');
  });

  it('WARP_LOOKUP covers ladders', () => {
    // 23→33 is "Short Squeeze Ramp"
    const warp = WARP_LOOKUP.get(23);
    expect(warp).toBeDefined();
    expect(warp?.type).toBe('ladder');
    expect(warp?.to).toBe(33);
  });
});

describe('greeks constants', () => {
  it('provides default greek config', () => {
    expect(DEFAULT_GREEK_CONFIG.theta.decayPerTurnPercent).toBe(0.5);
    expect(DEFAULT_GREEK_CONFIG.gamma.onCorrectViewMultiplier).toBe(1.5);
    expect(DEFAULT_GREEK_CONFIG.vega.vixThreshold).toBe(25);
  });

  it('getConvictionScalar returns increasing values', () => {
    const s1 = getConvictionScalar(1);
    const s3 = getConvictionScalar(3);
    const s5 = getConvictionScalar(5);
    expect(s3).toBeGreaterThan(s1);
    expect(s5).toBeGreaterThan(s3);
  });

  it('rollDice returns 1-6', () => {
    for (let i = 0; i < 100; i++) {
      const v = rollDice();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it('generateMarketOutcome returns Bullish, Bearish, or Neutral', () => {
    for (let i = 0; i < 50; i++) {
      const outcome = generateMarketOutcome();
      expect(['Bullish', 'Bearish', 'Neutral']).toContain(outcome);
    }
  });
});

describe('tiers', () => {
  it('defines all 3 tiers', () => {
    expect(TIER_DEFINITIONS).toHaveLength(3);
    const names = TIER_DEFINITIONS.map((t) => t.tier);
    expect(names).toContain(SubscriptionTier.Apprentice);
    expect(names).toContain(SubscriptionTier.MarketWarrior);
    expect(names).toContain(SubscriptionTier.BillionaireGuild);
  });
});

describe('quests & presets', () => {
  it('has quest templates', () => {
    expect(QUEST_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('has market presets', () => {
    expect(Object.keys(MARKET_PRESETS).length).toBeGreaterThanOrEqual(4);
  });
});

describe('feature flags', () => {
  it('grants Apprentice access to Apprentice features', () => {
    expect(hasFeatureAccess(SubscriptionTier.Apprentice, 'basicBoard')).toBe(true);
  });

  it('denies Apprentice access to guild features', () => {
    expect(hasFeatureAccess(SubscriptionTier.Apprentice, 'tournamentAccess')).toBe(false);
  });

  it('grants BillionaireGuild access to everything', () => {
    expect(hasFeatureAccess(SubscriptionTier.BillionaireGuild, 'tournamentAccess')).toBe(true);
    expect(hasFeatureAccess(SubscriptionTier.BillionaireGuild, 'customBoards')).toBe(true);
  });
});
