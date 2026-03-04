import { describe, it, expect, beforeEach } from 'vitest';
import { TurnEngine } from '../../engine/TurnEngine';
import { createMockPlayer, createMockTurnCommand } from '@game/shared';
import type { Player, TurnCommand, VIXLevel } from '@game/shared';

describe('TurnEngine', () => {
  let engine: TurnEngine;
  let player: Player;
  let vix: VIXLevel;

  beforeEach(() => {
    engine = new TurnEngine();
    player = createMockPlayer({ displayName: 'EngineTest', capital: 100000, position: 10 });
    vix = { value: 20, regime: 'normal', timestamp: Date.now() };
  });

  it('produces a turn result with all required fields', async () => {
    const command: TurnCommand = createMockTurnCommand({
      playerId: player.id,
      view: 'Bullish',
      conviction: 3,
    });

    const result = await engine.processTurn(player, command, vix);

    expect(result.playerId).toBe(player.id);
    expect(result.diceRoll).toBeGreaterThanOrEqual(1);
    expect(result.diceRoll).toBeLessThanOrEqual(6);
    expect(result.newPosition).toBeGreaterThanOrEqual(1);
    expect(result.newPosition).toBeLessThanOrEqual(100);
    expect(result.capitalAfter).toBeGreaterThanOrEqual(0);
    expect(typeof result.viewCorrect).toBe('boolean');
    expect(typeof result.isMarginCalled).toBe('boolean');
    expect(result.previousPosition).toBe(10);
    expect(result.capitalBefore).toBe(100000);
  });

  it('handles stunned player by skipping the turn', async () => {
    player.stunTurns = 2;
    const command = createMockTurnCommand({ playerId: player.id });

    const result = await engine.processTurn(player, command, vix);

    expect(result.skipped).toBe(true);
    expect(result.newPosition).toBe(player.position);
  });

  it('detects win at position 100', async () => {
    player.position = 95;
    const command = createMockTurnCommand({ playerId: player.id });

    // We'll run many iterations to try to get a dice roll that lands on 100
    let foundWin = false;
    for (let i = 0; i < 200; i++) {
      const p = { ...player, position: 95 };
      const result = await engine.processTurn(p, command, vix);
      if (result.newPosition === 100) {
        foundWin = true;
        expect(result.hasWon).toBe(true);
        break;
      }
    }
    // Probabilistic — with roll=5, position 95+5=100. Probability per trial = 1/6
    // In 200 trials, probability of never hitting = (5/6)^200 ≈ 0
    expect(foundWin).toBe(true);
  });
});
