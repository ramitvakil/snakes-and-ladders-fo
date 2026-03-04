import type { Player, VIXLevel, BotDifficulty } from '@game/shared';
import { getStrategy, type BotDecision } from './BotStrategies.js';
import { createChildLogger } from '../config/logger.js';

const log = createChildLogger('bot:engine');

/**
 * BotEngine manages bot decision-making for AI opponents.
 * It delegates to difficulty-specific strategies and adds personality variance.
 */
export class BotEngine {
  /**
   * Get a bot's decision for the current turn.
   *
   * @param bot - The bot player state
   * @param vixLevel - Current VIX level
   * @param opponents - Other players in the game
   * @returns The bot's view and conviction decision
   */
  decide(bot: Player, vixLevel: VIXLevel, opponents: Player[]): BotDecision {
    const difficulty = (bot.botDifficulty ?? 'adaptive') as BotDifficulty;
    const strategy = getStrategy(difficulty);

    const decision = strategy.decide(bot, vixLevel, opponents);

    // Add slight randomness for personality (10% chance to deviate)
    if (Math.random() < 0.1) {
      const views = ['Bullish', 'Bearish', 'Neutral'] as const;
      decision.view = views[Math.floor(Math.random() * 3)]!;
    }

    log.debug(
      {
        botId: bot.id,
        difficulty,
        view: decision.view,
        conviction: decision.conviction,
        capital: bot.capital,
        position: bot.position,
        vix: vixLevel.value,
      },
      'Bot decision made',
    );

    return decision;
  }

  /**
   * Add a slight delay to simulate "thinking" (for UI experience).
   * Returns a promise that resolves after a random delay.
   */
  async simulateThinkingDelay(difficulty: BotDifficulty): Promise<void> {
    const delays: Record<BotDifficulty, [number, number]> = {
      conservative: [800, 2000],
      aggressive: [300, 800],
      adaptive: [500, 1500],
    };

    const [min, max] = delays[difficulty] ?? [500, 1500];
    const delay = min + Math.random() * (max - min);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
