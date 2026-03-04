import type { Player, TurnCommand, TurnResult, AppliedModifier } from '@game/shared';
import { TurnPhase, VALID_PHASE_TRANSITIONS } from '@game/shared';
import { createChildLogger } from '../config/logger.js';

const log = createChildLogger('engine:turn');

/**
 * Middleware-style pipeline stage.
 * Each stage can read/write the TurnContext, then call next() to continue.
 */
export interface TurnContext {
  /** Current turn phase */
  phase: TurnPhase;
  /** The player taking this turn */
  player: Player;
  /** The incoming command from the player/bot */
  command: TurnCommand;
  /** Building up the result incrementally */
  result: Partial<TurnResult>;
  /** Modifiers applied during this turn */
  appliedModifiers: AppliedModifier[];
  /** Whether to halt the pipeline early (e.g. stunned player) */
  halted: boolean;
  /** Reason for halting */
  haltReason?: string;
  /** Metadata bag for inter-stage communication */
  meta: Record<string, unknown>;
}

export type PipelineStage = (ctx: TurnContext, next: () => void) => void;

/**
 * TurnPipeline is the central calculation engine.
 *
 * It runs a command through a chain of ordered stages:
 *   Roll → Move → TileEffect → Modifier → Conviction → Capital → HealthCheck
 *
 * Each stage mutates the TurnContext. If a stage sets ctx.halted = true,
 * remaining stages are skipped.
 */
export class TurnPipeline {
  private stages: { name: string; fn: PipelineStage }[] = [];

  /**
   * Register a named pipeline stage.
   */
  use(name: string, fn: PipelineStage): this {
    this.stages.push({ name, fn });
    return this;
  }

  /**
   * Execute the pipeline with a command and player state.
   * Returns the fully computed TurnResult.
   */
  execute(player: Player, command: TurnCommand): TurnResult {
    const ctx: TurnContext = {
      phase: TurnPhase.ROLL,
      player: { ...player }, // shallow clone to avoid mutation
      command,
      result: {
        playerId: player.id,
        gameId: command.gameId,
        turnNumber: command.turnNumber,
        previousPosition: player.position,
        previousCapital: player.capital,
        appliedModifiers: [],
        isStunned: false,
        isMarginCall: false,
        isGameWon: false,
      },
      appliedModifiers: [],
      halted: false,
      meta: {},
    };

    let index = 0;

    const next = () => {
      if (ctx.halted) {
        log.debug(
          { turn: command.turnNumber, reason: ctx.haltReason },
          'Pipeline halted early',
        );
        return;
      }

      if (index >= this.stages.length) return;

      const stage = this.stages[index]!;
      index++;

      log.debug(
        { stage: stage.name, phase: ctx.phase, turn: command.turnNumber },
        'Executing pipeline stage',
      );

      try {
        stage.fn(ctx, next);
      } catch (err) {
        log.error({ err, stage: stage.name }, 'Pipeline stage error');
        ctx.halted = true;
        ctx.haltReason = `Error in ${stage.name}: ${(err as Error).message}`;
      }
    };

    next();

    // Finalize result
    ctx.result.appliedModifiers = ctx.appliedModifiers;

    return ctx.result as TurnResult;
  }
}

/**
 * Validates that a phase transition is valid.
 */
export function validatePhaseTransition(from: TurnPhase, to: TurnPhase): boolean {
  const allowed = VALID_PHASE_TRANSITIONS[from];
  return allowed === to;
}
