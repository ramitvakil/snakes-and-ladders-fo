import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPipeline } from '../../engine/TurnPipeline';
import { createMockPlayer, createMockTurnCommand } from '@game/shared';
import type { Player, TurnCommand } from '@game/shared';

describe('TurnPipeline', () => {
  let pipeline: TurnPipeline;
  let player: Player;
  let command: TurnCommand;

  beforeEach(() => {
    player = createMockPlayer({ displayName: 'Test' });
    command = createMockTurnCommand({ playerId: player.id });
    pipeline = new TurnPipeline();
  });

  it('executes stages in order', async () => {
    const order: string[] = [];

    pipeline.use('stage-a', async (ctx) => {
      order.push('a');
      return ctx;
    });
    pipeline.use('stage-b', async (ctx) => {
      order.push('b');
      return ctx;
    });

    await pipeline.execute(player, command);
    expect(order).toEqual(['a', 'b']);
  });

  it('returns a valid TurnResult', async () => {
    pipeline.use('noop', async (ctx) => ctx);
    const result = await pipeline.execute(player, command);

    expect(result.playerId).toBe(player.id);
    expect(result.previousPosition).toBe(player.position);
  });

  it('halts pipeline when a stage sets halted=true', async () => {
    const order: string[] = [];

    pipeline.use('halting', async (ctx) => {
      order.push('halting');
      ctx.halted = true;
      ctx.haltReason = 'test halt';
      return ctx;
    });
    pipeline.use('after-halt', async (ctx) => {
      order.push('should-not-run');
      return ctx;
    });

    await pipeline.execute(player, command);
    expect(order).toEqual(['halting']);
  });
});
