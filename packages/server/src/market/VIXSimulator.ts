import type { VIXLevel, MarketSimulationConfig } from '@game/shared';
import { MARKET_PRESETS } from '@game/shared';
import { createChildLogger } from '../config/logger.js';
import { env } from '../config/env.js';

const log = createChildLogger('market:vix');

/**
 * VIXSimulator generates realistic VIX-style market volatility ticks.
 * Uses mean-reverting Ornstein-Uhlenbeck process with optional regime shifts.
 */
export class VIXSimulator {
  private currentLevel: number;
  private config: MarketSimulationConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(level: VIXLevel) => void> = [];

  constructor(config?: Partial<MarketSimulationConfig>) {
    const preset = MARKET_PRESETS['normal'] ?? MARKET_PRESETS['calm']!;
    this.config = {
      ...preset,
      ...config,
    };
    this.currentLevel = env.VIX_MEAN;
  }

  /**
   * Start the periodic VIX tick generator.
   */
  start(): void {
    if (this.intervalId) return;

    log.info(
      { tickMs: env.VIX_TICK_MS, mean: env.VIX_MEAN, volatility: env.VIX_VOLATILITY },
      'VIX simulator started',
    );

    this.intervalId = setInterval(() => {
      this.tick();
    }, env.VIX_TICK_MS);
  }

  /**
   * Stop the VIX simulator.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log.info('VIX simulator stopped');
    }
  }

  /**
   * Register a listener for VIX level updates.
   */
  onTick(listener: (level: VIXLevel) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Get the current VIX level.
   */
  getLevel(): VIXLevel {
    return this.computeVIXLevel(this.currentLevel);
  }

  /**
   * Manually set VIX level (useful for testing or admin controls).
   */
  setLevel(level: number): void {
    this.currentLevel = Math.max(10, Math.min(80, level));
  }

  /**
   * Generate a single VIX tick using Ornstein-Uhlenbeck process.
   */
  private tick(): void {
    const { kappa, sigma } = this.config;
    const mean = env.VIX_MEAN;

    // Ornstein-Uhlenbeck: dX = θ(μ - X)dt + σdW
    const dt = env.VIX_TICK_MS / 1000;
    const drift = kappa * (mean - this.currentLevel) * dt;
    const diffusion = sigma * Math.sqrt(dt) * this.gaussianRandom();

    // Regime shift: small chance of a spike or crash
    let regimeShift = 0;
    if (Math.random() < 0.02) {
      // 2% chance of regime event per tick
      regimeShift = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10);
      log.info({ shift: regimeShift }, 'VIX regime shift');
    }

    this.currentLevel = Math.max(
      10,
      Math.min(80, this.currentLevel + drift + diffusion + regimeShift),
    );

    const level = this.computeVIXLevel(this.currentLevel);

    for (const listener of this.listeners) {
      try {
        listener(level);
      } catch (err) {
        log.error({ err }, 'VIX listener error');
      }
    }
  }

  /**
   * Convert raw VIX number to a structured VIXLevel.
   */
  private computeVIXLevel(raw: number): VIXLevel {
    let regime: VIXLevel['regime'];
    if (raw < 15) regime = 'calm';
    else if (raw < 25) regime = 'normal';
    else if (raw < 40) regime = 'elevated';
    else if (raw < 55) regime = 'high';
    else regime = 'extreme';

    return {
      value: Number(raw.toFixed(2)),
      regime,
      timestamp: Date.now(),
    };
  }

  /**
   * Standard normal via Box-Muller transform.
   */
  private gaussianRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}
