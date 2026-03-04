import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../engine/GameEngine';
import { createMockPlayer } from '@game/shared';
import type { Player, VIXLevel } from '@game/shared';

describe('GameEngine', () => {
  let players: Player[];
  let vix: VIXLevel;

  beforeEach(() => {
    players = [
      createMockPlayer({ displayName: 'Alice', capital: 100000 }),
      createMockPlayer({ displayName: 'Bob', capital: 100000 }),
    ];
    vix = { value: 20, regime: 'normal', timestamp: Date.now() };
  });

  it('starts a game with correct initial state', () => {
    const engine = new GameEngine(players, vix);
    const snap = engine.toSnapshot();

    expect(snap.status).toBe('in_progress');
    expect(snap.players).toHaveLength(2);
    expect(snap.currentTurnPlayerId).toBe(players[0].id);
    expect(snap.turnNumber).toBe(0);
  });

  it('advances turns correctly', async () => {
    const engine = new GameEngine(players, vix);

    // Execute a turn for player 0
    await engine.executeTurn({
      playerId: players[0].id,
      view: 'Bullish',
      conviction: 2,
    });

    const snap = engine.toSnapshot();
    expect(snap.turnNumber).toBe(1);
    expect(snap.currentTurnPlayerId).toBe(players[1].id);
  });

  it('rejects turns from wrong player', async () => {
    const engine = new GameEngine(players, vix);

    await expect(
      engine.executeTurn({
        playerId: players[1].id, // Not their turn
        view: 'Bullish',
        conviction: 1,
      }),
    ).rejects.toThrow();
  });

  it('detects game over when a player wins', async () => {
    // Set player near the end
    players[0].position = 99;
    const engine = new GameEngine(players, vix);

    // This is probabilistic — keep trying
    let gameEnded = false;
    for (let i = 0; i < 200 && !gameEnded; i++) {
      const p = engine.toSnapshot().players;
      const current = engine.toSnapshot().currentTurnPlayerId;
      try {
        const result = await engine.executeTurn({
          playerId: current,
          view: 'Bullish',
          conviction: 1,
        });
        if (engine.toSnapshot().status === 'finished') {
          gameEnded = true;
        }
      } catch {
        // May fail if wrong turn order after wrapping — expected
      }
    }
    // With position 99, dice=1 → 100 → win. P(not in 200 rolls) ≈ 0
    expect(gameEnded).toBe(true);
  });

  it('creates/restores snapshots', () => {
    const engine = new GameEngine(players, vix);
    const snap = engine.toSnapshot();

    const restored = GameEngine.fromSnapshot(snap);
    const snap2 = restored.toSnapshot();

    expect(snap2.gameId).toBe(snap.gameId);
    expect(snap2.players).toEqual(snap.players);
  });
});
