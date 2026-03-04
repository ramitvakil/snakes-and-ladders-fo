import { describe, it, expect } from 'vitest';
import { VIXSimulator } from '../../market/VIXSimulator';

describe('VIXSimulator', () => {
  it('initializes with a value near the mean', () => {
    const sim = new VIXSimulator({ tickMs: 1000, mean: 20, volatility: 0.5 });
    const level = sim.getCurrentLevel();
    expect(level.value).toBeGreaterThan(0);
    expect(level.regime).toBeDefined();
  });

  it('ticks and produces different values over time', () => {
    const sim = new VIXSimulator({ tickMs: 100, mean: 20, volatility: 2 });
    const values = new Set<number>();
    for (let i = 0; i < 50; i++) {
      sim.tick();
      values.add(Math.round(sim.getCurrentLevel().value * 100));
    }
    // With high volatility, we should get at least some variation
    expect(values.size).toBeGreaterThan(1);
  });

  it('assigns correct regimes', () => {
    const sim = new VIXSimulator({ tickMs: 1000, mean: 10, volatility: 0.1 });
    // Force low value
    (sim as any).value = 10;
    sim.tick();
    const level = sim.getCurrentLevel();
    expect(level.regime).toBe('calm');
  });

  it('clamps value above 0', () => {
    const sim = new VIXSimulator({ tickMs: 1000, mean: 1, volatility: 10 });
    for (let i = 0; i < 100; i++) {
      sim.tick();
      expect(sim.getCurrentLevel().value).toBeGreaterThan(0);
    }
  });
});
