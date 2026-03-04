import type { MarketView } from './player';
import type { TileEffect } from './board';

// ─── Turn Phases (FSM) ────────────────────────────────────
export enum TurnPhase {
  AWAITING_VIEW = 'AWAITING_VIEW',
  AWAITING_ROLL = 'AWAITING_ROLL',
  ROLL = 'ROLL',
  MOVE = 'MOVE',
  TILE_EFFECT = 'TILE_EFFECT',
  MODIFIER = 'MODIFIER',
  CONVICTION = 'CONVICTION',
  CAPITAL = 'CAPITAL',
  HEALTH_CHECK = 'HEALTH_CHECK',
  TURN_COMPLETE = 'TURN_COMPLETE',
}

// ─── Valid phase transitions ───────────────────────────────
export const VALID_PHASE_TRANSITIONS: Record<TurnPhase, TurnPhase | null> = {
  [TurnPhase.AWAITING_VIEW]: TurnPhase.AWAITING_ROLL,
  [TurnPhase.AWAITING_ROLL]: TurnPhase.ROLL,
  [TurnPhase.ROLL]: TurnPhase.MOVE,
  [TurnPhase.MOVE]: TurnPhase.TILE_EFFECT,
  [TurnPhase.TILE_EFFECT]: TurnPhase.MODIFIER,
  [TurnPhase.MODIFIER]: TurnPhase.CONVICTION,
  [TurnPhase.CONVICTION]: TurnPhase.CAPITAL,
  [TurnPhase.CAPITAL]: TurnPhase.HEALTH_CHECK,
  [TurnPhase.HEALTH_CHECK]: TurnPhase.TURN_COMPLETE,
  [TurnPhase.TURN_COMPLETE]: null, // reset to AWAITING_VIEW for next turn
};

// ─── Turn Command (input for the pipeline) ─────────────────
export interface TurnCommand {
  playerId: string;
  gameId: string;
  turnNumber: number;
  declaredView: MarketView;
  convictionMultiplier: number; // 1–5
  diceRoll: number; // 1–6, generated server-side
  /** The "true" market outcome for this turn (random) */
  marketOutcome: MarketView;
  /** Current VIX level at time of turn */
  vixLevel: number;
}

// ─── Turn Result (output of the pipeline) ───────────────────
export interface TurnResult {
  playerId: string;
  gameId: string;
  turnNumber: number;

  // Position
  previousPosition: number;
  newPosition: number;
  /** Spaces actually moved (after all modifiers) */
  spacesMovedRaw: number;

  // Capital
  previousCapital: number;
  capitalDelta: number;
  finalCapital: number;

  // Effects applied
  tileEffect: TileEffect | null;
  tileName: string | null;
  appliedModifiers: AppliedModifier[];

  // State changes
  isStunned: boolean;
  isMarginCall: boolean;
  isGameWon: boolean;

  // Meta
  diceRoll: number;
  declaredView: MarketView;
  marketOutcome: MarketView;
  viewMatched: boolean;
  convictionMultiplier: number;
  gammaMultiplier: number;
  thetaApplied: boolean;
  vixLevel: number;
  vixPenaltyApplied: boolean;
}

// ─── Applied Modifier (for logging) ────────────────────────
export interface AppliedModifier {
  type: string;
  name: string;
  value: number;
  source: string; // human-readable description
}

// ─── Turn Log Entry (persisted) ────────────────────────────
export interface TurnLogEntry {
  id: string;
  gameId: string;
  playerId: string;
  turnNumber: number;
  command: TurnCommand;
  result: TurnResult;
  timestamp: Date;
}
