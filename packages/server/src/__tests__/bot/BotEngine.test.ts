import { describe, it, expect } from 'vitest';
import { BotEngine } from '../../bot/BotEngine';
import { createMockPlayer, createMockVIXLevel } from '@game/shared';
import type { Player, VIXLevel } from '@game/shared';

describe('BotEngine', () => {
  it('produces a decision for easy difficulty', () => {
    const bot: Player = createMockPlayer({ isBot: true, botDifficulty: 'easy' });
    const players: Player[] = [bot, createMockPlayer()];
    const vix: VIXLevel = createMockVIXLevel();

    const engine = new BotEngine();
    const decision = engine.decide(bot, players, vix);

    expect(['Bullish', 'Bearish', 'Neutral']).toContain(decision.view);
    expect(decision.conviction).toBeGreaterThanOrEqual(1);
    expect(decision.conviction).toBeLessThanOrEqual(5);
  });

  it('produces a decision for hard difficulty', () => {
    const bot: Player = createMockPlayer({ isBot: true, botDifficulty: 'hard' });
    const players: Player[] = [bot, createMockPlayer()];
    const vix: VIXLevel = createMockVIXLevel({ value: 35, regime: 'elevated' });

    const engine = new BotEngine();
    const decision = engine.decide(bot, players, vix);

    expect(['Bullish', 'Bearish', 'Neutral']).toContain(decision.view);
    expect(decision.conviction).toBeGreaterThanOrEqual(1);
    expect(decision.conviction).toBeLessThanOrEqual(5);
  });

  it('returns thinking delay within expected range', () => {
    const engine = new BotEngine();
    const delay = engine.simulateThinkingDelay('easy');
    expect(delay).toBeGreaterThanOrEqual(500);
    expect(delay).toBeLessThanOrEqual(3000);
  });
});
