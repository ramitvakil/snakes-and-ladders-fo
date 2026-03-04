// ─── Tile Types ────────────────────────────────────────────
export enum TileType {
  Neutral = 'Neutral',
  Snake = 'Snake',
  Ladder = 'Ladder',
  Event = 'Event',
}

// ─── Tile Effect Types ─────────────────────────────────────
export type TileEffectType =
  | 'none'
  | 'warp' // move to a different position
  | 'capital_change' // add/subtract capital %
  | 'capital_percent' // percentage-based capital change
  | 'capital_flat' // flat capital change
  | 'buff' // apply a timed buff
  | 'debuff' // apply a timed debuff
  | 'view_reset' // reset currentView to null
  | 'stun' // stun for N turns
  | 'teleport' // teleport to specific tile
  | 'compound'; // multiple effects combined

export interface TileEffect {
  type: TileEffectType;
  /** For 'warp': target position */
  warpTo?: number;
  /** For 'capital_change': percentage delta (+5 = gain 5%, -3 = lose 3%) */
  capitalDelta?: number;
  /** Generic value field for effects */
  value?: number;
  /** For 'buff'/'debuff': movement multiplier, lasting N turns */
  movementMultiplier?: number;
  buffDuration?: number;
  buffName?: string;
  buffType?: string;
  duration?: number;
  /** For 'stun': number of turns */
  stunTurns?: number;
  /** For 'teleport': destination tile */
  destination?: number;
  /** Effect name for display */
  name?: string;
  /** For 'compound': array of sub-effects */
  subEffects?: TileEffect[];
}

// ─── Tile Definition ───────────────────────────────────────
export interface TileDefinition {
  /** Position on board 1–100 */
  position: number;
  type: TileType;
  /** Name visible to player */
  name: string;
  /** F&O themed flavor text */
  flavor: string;
  /** Effect applied when landing */
  effect: TileEffect;
}

// ─── Warp Edge (Snake or Ladder connections) ───────────────
export interface WarpEdge {
  from: number;
  to: number;
  type: 'snake' | 'ladder';
  name: string;
}

// ─── Board Map ─────────────────────────────────────────────
export interface BoardMap {
  tiles: TileDefinition[];
  warps: WarpEdge[];
  /** Total tiles on the board */
  size: number;
}
