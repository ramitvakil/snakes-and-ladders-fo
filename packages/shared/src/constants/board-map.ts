import { TileType } from '../types/board';
import type { TileDefinition, WarpEdge, BoardMap } from '../types/board';

// ─── Warp Edges (Snakes & Ladders connections) ─────────────

export const WARP_EDGES: WarpEdge[] = [
  // Ladders (climb up)
  { from: 23, to: 33, type: 'ladder', name: 'Short Squeeze Ramp' },
  { from: 44, to: 68, type: 'ladder', name: 'Option Premium Jackpot' },
  { from: 67, to: 82, type: 'ladder', name: 'FII Inflow Rally' },
  { from: 8, to: 26, type: 'ladder', name: 'IPO Listing Gains' },
  { from: 34, to: 48, type: 'ladder', name: 'Bullish Breakout' },
  { from: 72, to: 91, type: 'ladder', name: 'Short Covering Rally' },

  // Snakes (slide down)
  { from: 78, to: 54, type: 'snake', name: 'Margin Trap' },
  { from: 97, to: 76, type: 'snake', name: 'SEBI Regulation Shock' },
  { from: 56, to: 33, type: 'snake', name: 'Stop Loss Hunt' },
  { from: 87, to: 63, type: 'snake', name: 'Liquidity Trap' },
  { from: 47, to: 19, type: 'snake', name: 'Gap Down Opening' },
  { from: 64, to: 42, type: 'snake', name: 'FII Outflow' },
];

// ─── Special Tile Definitions ──────────────────────────────

const SPECIAL_TILES: TileDefinition[] = [
  // ── Ladder tiles ──
  {
    position: 23,
    type: TileType.Ladder,
    name: 'Short Squeeze Ramp',
    flavor: 'Bears caught offside! Short sellers scramble to cover as Nifty rockets up 500 points.',
    effect: { type: 'warp', warpTo: 33 },
  },
  {
    position: 44,
    type: TileType.Ladder,
    name: 'Option Premium Jackpot',
    flavor: 'Your OTM calls just went deep ITM! Premium explodes 10x overnight.',
    effect: {
      type: 'compound',
      subEffects: [
        { type: 'warp', warpTo: 68 },
        { type: 'capital_change', capitalDelta: 8 },
      ],
    },
  },
  {
    position: 51,
    type: TileType.Ladder,
    name: 'Earnings Surprise',
    flavor: 'Company beats estimates by 40%! Upper circuit for 3 sessions.',
    effect: {
      type: 'buff',
      movementMultiplier: 2.0,
      buffDuration: 3,
      buffName: 'Earnings Momentum',
    },
  },
  {
    position: 67,
    type: TileType.Ladder,
    name: 'FII Inflow Rally',
    flavor: 'Foreign Institutional Investors pour ₹5000 Cr into Indian markets. Bull run continues!',
    effect: { type: 'warp', warpTo: 82 },
  },
  {
    position: 8,
    type: TileType.Ladder,
    name: 'IPO Listing Gains',
    flavor: 'Your IPO allotment lists at 90% premium! Easy money.',
    effect: { type: 'warp', warpTo: 26 },
  },
  {
    position: 34,
    type: TileType.Ladder,
    name: 'Bullish Breakout',
    flavor: 'Nifty breaks all-time high with massive volumes. Momentum traders pile in!',
    effect: { type: 'warp', warpTo: 48 },
  },
  {
    position: 72,
    type: TileType.Ladder,
    name: 'Short Covering Rally',
    flavor: 'Weekly expiry forces bears to buy back. Market zooms up in the last hour.',
    effect: { type: 'warp', warpTo: 91 },
  },

  // ── Snake tiles ──
  {
    position: 62,
    type: TileType.Snake,
    name: 'Fat Finger',
    flavor: 'A dealer accidentally places a sell order 10x the intended size. Your P&L bleeds.',
    effect: { type: 'capital_change', capitalDelta: -5 },
  },
  {
    position: 95,
    type: TileType.Snake,
    name: 'Policy Pivot',
    flavor: 'RBI surprises with an unexpected rate hike. All your directional bets are worthless.',
    effect: { type: 'view_reset' },
  },
  {
    position: 78,
    type: TileType.Snake,
    name: 'Margin Trap',
    flavor: 'NSE increases margin requirements overnight. Forced to liquidate positions at a loss.',
    effect: { type: 'warp', warpTo: 54 },
  },
  {
    position: 39,
    type: TileType.Snake,
    name: 'IV Crush',
    flavor: 'Post-event IV collapses. Your long straddle loses 70% of its value in one session.',
    effect: {
      type: 'compound',
      subEffects: [
        { type: 'capital_change', capitalDelta: -3 },
        { type: 'stun', stunTurns: 1 },
      ],
    },
  },
  {
    position: 97,
    type: TileType.Snake,
    name: 'SEBI Regulation Shock',
    flavor: 'New SEBI circular bans your favourite strategy. Position limits slashed by half.',
    effect: { type: 'warp', warpTo: 76 },
  },
  {
    position: 56,
    type: TileType.Snake,
    name: 'Stop Loss Hunt',
    flavor: 'Algos trigger a cascade of stop losses. Market whipsaws and takes out your position.',
    effect: { type: 'warp', warpTo: 33 },
  },
  {
    position: 87,
    type: TileType.Snake,
    name: 'Liquidity Trap',
    flavor: 'Your large position has no liquidity at the bid. Slippage eats your profits.',
    effect: {
      type: 'compound',
      subEffects: [
        { type: 'warp', warpTo: 63 },
        { type: 'capital_change', capitalDelta: -2 },
      ],
    },
  },
  {
    position: 47,
    type: TileType.Snake,
    name: 'Gap Down Opening',
    flavor: 'Global selloff overnight. Nifty opens 3% gap down. Your calls are worthless.',
    effect: { type: 'warp', warpTo: 19 },
  },
  {
    position: 64,
    type: TileType.Snake,
    name: 'FII Outflow',
    flavor: 'FIIs dump ₹10,000 Cr in a single session. DII buying not enough to stop the bleeding.',
    effect: { type: 'warp', warpTo: 42 },
  },

  // ── Event tiles ──
  {
    position: 10,
    type: TileType.Event,
    name: 'RBI Rate Decision',
    flavor: 'The Governor approaches the mic. Markets hold their breath...',
    effect: { type: 'none' }, // resolved dynamically by EventTile strategy
  },
  {
    position: 25,
    type: TileType.Event,
    name: 'Budget Day',
    flavor: 'Finance Minister unfolds the budget. Every sector waits for their fate.',
    effect: { type: 'none' },
  },
  {
    position: 40,
    type: TileType.Event,
    name: 'Expiry Day Chaos',
    flavor: 'Monthly expiry. Max pain is 100 points away. Who will blink first?',
    effect: { type: 'none' },
  },
  {
    position: 55,
    type: TileType.Event,
    name: 'Block Deal',
    flavor: 'A mysterious block deal appears on the tape. ₹2000 Cr changes hands.',
    effect: { type: 'none' },
  },
  {
    position: 70,
    type: TileType.Event,
    name: 'Global Macro Shock',
    flavor: 'US Fed changes tone. Bond yields spike. Emerging markets tumble.',
    effect: { type: 'none' },
  },
  {
    position: 85,
    type: TileType.Event,
    name: 'Circuit Breaker',
    flavor: 'Market hits 10% limit. Trading halted for 45 minutes. Panic or opportunity?',
    effect: { type: 'none' },
  },
];

// ─── Generate Full 100-Tile Board ──────────────────────────

function generateBoardTiles(): TileDefinition[] {
  const tiles: TileDefinition[] = [];

  for (let pos = 1; pos <= 100; pos++) {
    const special = SPECIAL_TILES.find((t) => t.position === pos);
    if (special) {
      tiles.push(special);
    } else {
      tiles.push({
        position: pos,
        type: TileType.Neutral,
        name: pos === 1 ? 'Market Open' : pos === 100 ? 'Ring the Bell' : `Tile ${pos}`,
        flavor:
          pos === 1
            ? 'Your trading journey begins. Capital deployed!'
            : pos === 100
              ? 'You made it! Ring the closing bell in triumph!'
              : getNeutralFlavor(pos),
        effect: { type: 'none' },
      });
    }
  }

  return tiles;
}

function getNeutralFlavor(pos: number): string {
  const flavors = [
    'Markets trading sideways. No clear direction.',
    'Quiet session. Volumes below average.',
    'Nifty consolidating near support levels.',
    'Bank Nifty range-bound. Theta eating both sides.',
    'Mid-cap index slightly green. Not much action.',
    'Sectoral rotation underway. Some winners, some losers.',
    'SGX Nifty suggests a flat opening tomorrow.',
    'Options chain shows heavy call writing at resistance.',
    'PCR ratio is neutral. Market in wait-and-watch mode.',
    'Retail activity picking up near round numbers.',
  ];
  return flavors[pos % flavors.length]!;
}

// ─── Exported Board Map ────────────────────────────────────

export const DEFAULT_BOARD_MAP: BoardMap = {
  tiles: generateBoardTiles(),
  warps: WARP_EDGES,
  size: 100,
};

/**
 * Quick lookup: position → warp target (if any)
 */
export const WARP_LOOKUP: Map<number, WarpEdge> = new Map(
  WARP_EDGES.map((w) => [w.from, w]),
);

/**
 * Quick lookup: position → tile definition
 */
export const TILE_LOOKUP: Map<number, TileDefinition> = new Map(
  DEFAULT_BOARD_MAP.tiles.map((t) => [t.position, t]),
);
