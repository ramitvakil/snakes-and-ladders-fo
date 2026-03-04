import type { Player, TurnCommand, TurnResult } from '@game/shared';
import { generateMarketOutcome, rollDice } from '@game/shared';
import { TurnPipeline } from './TurnPipeline.js';
import { rollStage } from './stages/rollStage.js';
import { moveStage } from './stages/moveStage.js';
import { tileEffectStage } from './stages/tileEffectStage.js';
import { modifierStage } from './stages/modifierStage.js';
import { convictionStage } from './stages/convictionStage.js';
import { capitalStage } from './stages/capitalStage.js';
import { healthCheckStage } from './stages/healthCheckStage.js';
import { createChildLogger } from '../config/logger.js';

const log = createChildLogger('engine:turn-engine');

/**
 * TurnEngine creates and configures the TurnPipeline, then
 * processes a single turn for a player.
 */
export class TurnEngine {
  private pipeline: TurnPipeline;

  constructor() {
    this.pipeline = new TurnPipeline();

    // Register stages in execution order
    this.pipeline
      .use('roll', rollStage)
      .use('move', moveStage)
      .use('tileEffect', tileEffectStage)
      .use('modifier', modifierStage)
      .use('conviction', convictionStage)
      .use('capital', capitalStage)
      .use('healthCheck', healthCheckStage);
  }

  /**
   * Process a complete turn for a player.
   *
   * @param player - Current player state (will be shallow-cloned internally)
   * @param command - The turn command (view, conviction, optional dice roll)
   * @returns The computed TurnResult
   */
  processTurn(player: Player, command: TurnCommand): TurnResult {
    // Fill in server-side values if not provided
    const fullCommand: TurnCommand = {
      ...command,
      diceRoll: command.diceRoll ?? rollDice(),
      marketOutcome: command.marketOutcome ?? generateMarketOutcome(command.vixLevel),
    };

    log.info(
      {
        playerId: player.id,
        turn: command.turnNumber,
        view: command.declaredView,
        conviction: command.convictionMultiplier,
        dice: fullCommand.diceRoll,
        market: fullCommand.marketOutcome,
        vix: command.vixLevel,
      },
      'Processing turn',
    );

    const result = this.pipeline.execute(player, fullCommand);

    log.info(
      {
        playerId: player.id,
        turn: command.turnNumber,
        from: result.previousPosition,
        to: result.newPosition,
        capitalDelta: result.capitalDelta,
        finalCapital: result.finalCapital,
        won: result.isGameWon,
        marginCall: result.isMarginCall,
        stunned: result.isStunned,
        tile: result.tileName,
      },
      'Turn processed',
    );

    return result;
  }
}
