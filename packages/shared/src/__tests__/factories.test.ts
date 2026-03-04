import { describe, it, expect } from 'vitest';
import {
  createMockPlayer,
  createMockBotPlayer,
  createMockTurnCommand,
  createMockTurnResult,
  createMockVIXLevel,
  createMockQuest,
  createMockGameState,
  createMockRoom,
  resetMockIds,
} from '@game/shared';

describe('test factories', () => {
  beforeEach(() => {
    resetMockIds();
  });

  it('creates a mock player with defaults', () => {
    const p = createMockPlayer();
    expect(p.id).toBeDefined();
    expect(p.capital).toBe(100000);
    expect(p.position).toBe(1);
    expect(p.isBot).toBe(false);
  });

  it('creates a mock player with overrides', () => {
    const p = createMockPlayer({ displayName: 'Test', capital: 50000 });
    expect(p.displayName).toBe('Test');
    expect(p.capital).toBe(50000);
  });

  it('creates a bot player', () => {
    const b = createMockBotPlayer();
    expect(b.isBot).toBe(true);
    expect(b.botDifficulty).toBeDefined();
  });

  it('creates a turn command', () => {
    const cmd = createMockTurnCommand();
    expect(cmd.playerId).toBeDefined();
    expect(cmd.view).toBeDefined();
    expect(cmd.conviction).toBeGreaterThanOrEqual(1);
    expect(cmd.conviction).toBeLessThanOrEqual(5);
  });

  it('creates a turn result', () => {
    const r = createMockTurnResult();
    expect(r.diceRoll).toBeGreaterThanOrEqual(1);
    expect(r.diceRoll).toBeLessThanOrEqual(6);
    expect(typeof r.viewCorrect).toBe('boolean');
  });

  it('creates a VIX level', () => {
    const v = createMockVIXLevel();
    expect(v.value).toBeGreaterThan(0);
    expect(v.regime).toBeDefined();
  });

  it('creates a quest', () => {
    const q = createMockQuest();
    expect(q.id).toBeDefined();
    expect(q.target).toBeGreaterThan(0);
  });

  it('creates a game state with players', () => {
    const g = createMockGameState(3);
    expect(g.players).toHaveLength(3);
    expect(g.gameId).toBeDefined();
  });

  it('creates a room', () => {
    const r = createMockRoom();
    expect(r.id).toBeDefined();
    expect(r.players.length).toBeGreaterThan(0);
  });
});
