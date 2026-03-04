// ─── Market View ───────────────────────────────────────────
export type MarketView = 'Bullish' | 'Bearish' | 'Sideways' | 'Neutral';

// ─── Conviction Levels ─────────────────────────────────────
export enum ConvictionLevel {
  Min = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  Max = 5,
}

// ─── Active Buff / Debuff on Player ────────────────────────
export interface PlayerBuff {
  type: string;
  multiplier: number;
  turnsRemaining: number;
  source: string; // tile name or event that granted it
}

// ─── Player State ──────────────────────────────────────────
export interface Player {
  id: string;
  displayName: string;
  /** Capital as percentage 0–100. Health bar. */
  capital: number;
  /** Board position 1–100 */
  position: number;
  /** Active buffs/hedges */
  buffs: PlayerBuff[];
  /** Declared market view for current turn, null if not yet set */
  currentView: MarketView | null;
  /** Conviction multiplier 1–5 */
  conviction: number;
  /** Turns remaining in stunned state (capital < 20%) */
  stunTurns: number;
  /** Permadeath — capital hit 0 */
  isMarginCalled: boolean;
  /** Capital history for sparkline (snapshot after each turn) */
  pnlHistory: number[];
  /** Is this player a bot? */
  isBot: boolean;
  /** Bot difficulty (only relevant if isBot) */
  botDifficulty?: BotDifficulty;
  /** Turn order in current game */
  turnOrder: number;
}

// ─── Bot ───────────────────────────────────────────────────
export type BotDifficulty = 'conservative' | 'aggressive' | 'adaptive';

export interface BotDecision {
  view: MarketView;
  conviction: number;
}

// ─── Player creation defaults ──────────────────────────────
export const DEFAULT_PLAYER_CAPITAL = 100;
export const DEFAULT_PLAYER_POSITION = 1;
export const STUN_THRESHOLD = 20; // capital % — below this → stunned
export const STUN_DURATION = 2; // turns
export const MARGIN_CALL_THRESHOLD = 0; // capital % — at or below → game over
