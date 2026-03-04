// ─── Greek Types ───────────────────────────────────────────
export enum GreekType {
  Delta = 'Delta',
  Gamma = 'Gamma',
  Theta = 'Theta',
  Vega = 'Vega',
}

// ─── Greek Modifier ────────────────────────────────────────
export interface GreekModifier {
  id: string;
  type: GreekType;
  /** Magnitude of the effect (multiplier or flat value) */
  magnitude: number;
  /** Turns remaining before this modifier expires. -1 = permanent */
  duration: number;
  /** Source that applied this modifier (tile name, event, etc.) */
  source: string;
  /** Human-readable description */
  description: string;
}

// ─── Greek Configuration (default values) ──────────────────
export interface GreekConfig {
  theta: {
    decayPerTurnPercent: number;
  };
  gamma: {
    onCorrectViewMultiplier: number;
    consecutiveCorrectMultiplier: number;
  };
  vega: {
    vixThreshold: number;
    snakePenaltyMultiplier: number;
    ladderBonusMultiplier: number;
  };
}

// ─── Modifier Stack (collection type) ──────────────────────
export interface ModifierStackState {
  modifiers: GreekModifier[];
}
