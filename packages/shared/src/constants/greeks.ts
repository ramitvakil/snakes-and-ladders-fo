import type { GreekConfig } from '../types/modifiers';

// ─── Default Greek Configuration ───────────────────────────

export const DEFAULT_GREEK_CONFIG: GreekConfig = {
  theta: {
    /** 0.5% capital drain per turn when position doesn't change */
    decayPerTurnPercent: 0.5,
  },
  gamma: {
    /** 1.5x movement multiplier when view matches market outcome */
    onCorrectViewMultiplier: 1.5,
    /** 2.0x when VIX > danger threshold or consecutive correct */
    consecutiveCorrectMultiplier: 2.0,
  },
  vega: {
    /** VIX danger threshold — above this, enhanced effects kick in */
    vixThreshold: 25,
    /** Double snake penalties when VIX > threshold */
    snakePenaltyMultiplier: 2.0,
    /** 1.5x ladder bonus when VIX > threshold */
    ladderBonusMultiplier: 1.5,
  },
};

// ─── Conviction Multiplier Scaling ─────────────────────────
// Conviction 1 → 1.0x, 2 → 1.25x, 3 → 1.5x, 4 → 1.75x, 5 → 2.0x
// Both gains AND losses are scaled

export function getConvictionScalar(conviction: number): number {
  const clamped = Math.max(1, Math.min(5, Math.round(conviction)));
  return 1 + (clamped - 1) * 0.25;
}

// ─── Dice Configuration ────────────────────────────────────

export const DICE_MIN = 1;
export const DICE_MAX = 6;

export function rollDice(): number {
  return Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN;
}

// ─── Market Outcome Probability ────────────────────────────

import type { MarketView } from '../types/player';

/**
 * Generate a random market outcome.
 * Probabilities shift based on VIX:
 * - Low VIX (<18): More likely Sideways (50%) or Bullish (30%)
 * - Normal VIX (18-25): Even distribution
 * - High VIX (>25): More likely Bearish (40%) or volatile swings
 */
export function generateMarketOutcome(vixLevel: number): MarketView {
  const roll = Math.random();

  if (vixLevel < 18) {
    // Low vol: Sideways-biased
    if (roll < 0.3) return 'Bullish';
    if (roll < 0.5) return 'Bearish';
    return 'Sideways';
  } else if (vixLevel <= 25) {
    // Normal: roughly even
    if (roll < 0.35) return 'Bullish';
    if (roll < 0.7) return 'Bearish';
    return 'Sideways';
  } else {
    // High vol: Bearish-biased, less sideways
    if (roll < 0.25) return 'Bullish';
    if (roll < 0.65) return 'Bearish';
    return 'Sideways';
  }
}
