import type { Player, MarketView, ConvictionLevel, BotDifficulty, VIXLevel } from '@game/shared';

/**
 * A bot decision: what view and conviction to declare.
 */
export interface BotDecision {
  view: MarketView;
  conviction: ConvictionLevel;
}

/**
 * Strategy interface – each difficulty level has a different strategy.
 */
export interface BotStrategy {
  decide(player: Player, vixLevel: VIXLevel, opponents: Player[]): BotDecision;
}

// ── Conservative: Low conviction, tends toward neutral/safe ──
export class ConservativeStrategy implements BotStrategy {
  decide(_player: Player, vixLevel: VIXLevel): BotDecision {
    const views: MarketView[] = ['Neutral', 'Bullish', 'Bearish'];
    // Bias toward Neutral in high VIX
    const weights = vixLevel.value > 25 ? [0.6, 0.2, 0.2] : [0.3, 0.35, 0.35];
    const view = this.weightedPick(views, weights);

    return {
      view,
      conviction: 1 as ConvictionLevel,
    };
  }

  private weightedPick<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i]!;
      if (random <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }
}

// ── Aggressive: High conviction, follows trends, momentum-based ──
export class AggressiveStrategy implements BotStrategy {
  decide(player: Player, vixLevel: VIXLevel): BotDecision {
    // In high VIX, be contrarian; in low VIX, follow the trend
    let view: MarketView;

    if (vixLevel.value > 35) {
      // Contrarian in panic
      view = Math.random() > 0.5 ? 'Bullish' : 'Bearish';
    } else {
      // Momentum: if capital is growing, be bullish
      const recentPnl = player.pnlHistory?.slice(-3) ?? [];
      const isGrowing =
        recentPnl.length >= 2 && recentPnl[recentPnl.length - 1]! > recentPnl[0]!;
      view = isGrowing ? 'Bullish' : 'Bearish';
    }

    // High conviction: 3-5
    const conviction = (Math.floor(Math.random() * 3) + 3) as ConvictionLevel;

    return { view, conviction };
  }
}

// ── Adaptive: Heuristic-based, considers opponents and VIX ──
export class AdaptiveStrategy implements BotStrategy {
  decide(player: Player, vixLevel: VIXLevel, opponents: Player[]): BotDecision {
    // Calculate risk appetite based on current capital position
    const capitalRatio = player.capital / 100; // relative to starting capital
    const isLeading = opponents.every((o) => player.capital >= o.capital);
    const isBehind = opponents.every((o) => player.capital < o.capital);

    let view: MarketView;
    let conviction: ConvictionLevel;

    if (vixLevel.regime === 'extreme' || vixLevel.regime === 'high') {
      // Play safe in extreme volatility
      view = 'Neutral';
      conviction = 1 as ConvictionLevel;
    } else if (isLeading) {
      // Protect lead: moderate conviction, trend-following
      view = this.analyzeVIXTrend(vixLevel);
      conviction = 2 as ConvictionLevel;
    } else if (isBehind) {
      // Catch up: higher risk
      view = Math.random() > 0.5 ? 'Bullish' : 'Bearish';
      conviction = Math.min(5, Math.floor(3 + (1 - capitalRatio) * 2)) as ConvictionLevel;
    } else {
      // Middle of pack: balanced approach
      view = this.analyzeVIXTrend(vixLevel);
      conviction = (Math.floor(Math.random() * 2) + 2) as ConvictionLevel;
    }

    // Stun avoidance: if capital is low, reduce conviction
    if (player.capital < 30) {
      conviction = Math.min(conviction, 2) as ConvictionLevel;
    }

    return { view, conviction };
  }

  private analyzeVIXTrend(vixLevel: VIXLevel): MarketView {
    // Simple heuristic: low VIX = bullish, high VIX = bearish
    if (vixLevel.value < 18) return 'Bullish';
    if (vixLevel.value > 28) return 'Bearish';
    return Math.random() > 0.5 ? 'Bullish' : 'Bearish';
  }
}

/**
 * Factory: get the right strategy for a bot difficulty level.
 */
export function getStrategy(difficulty: BotDifficulty): BotStrategy {
  switch (difficulty) {
    case 'conservative':
      return new ConservativeStrategy();
    case 'aggressive':
      return new AggressiveStrategy();
    case 'adaptive':
      return new AdaptiveStrategy();
    default:
      return new AdaptiveStrategy();
  }
}
