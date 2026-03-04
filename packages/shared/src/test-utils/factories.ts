import type { Player } from '../types/player';
import type { TurnCommand, TurnResult } from '../types/turn';
import type { VIXLevel, DailyQuest } from '../types/market';
import type { GameStateSnapshot, LobbyRoomInfo } from '../types/events';
import { TurnPhase } from '../types/turn';

// ─── IDs ───────────────────────────────────────────────────

let idCounter = 0;
function mockId(): string {
  idCounter++;
  return `mock-${idCounter.toString().padStart(6, '0')}`;
}

export function resetMockIds(): void {
  idCounter = 0;
}

// ─── Player Factory ────────────────────────────────────────

export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: mockId(),
    displayName: `Player_${idCounter}`,
    capital: 100,
    position: 1,
    buffs: [],
    currentView: null,
    conviction: 1,
    stunTurns: 0,
    isMarginCalled: false,
    pnlHistory: [100],
    isBot: false,
    turnOrder: 0,
    ...overrides,
  };
}

export function createMockBotPlayer(
  difficulty: 'conservative' | 'aggressive' | 'adaptive' = 'adaptive',
  overrides: Partial<Player> = {},
): Player {
  return createMockPlayer({
    displayName: `Bot_${difficulty}_${idCounter}`,
    isBot: true,
    botDifficulty: difficulty,
    ...overrides,
  });
}

// ─── Turn Command Factory ──────────────────────────────────

export function createMockTurnCommand(overrides: Partial<TurnCommand> = {}): TurnCommand {
  return {
    playerId: mockId(),
    gameId: mockId(),
    turnNumber: 1,
    declaredView: 'Bullish',
    convictionMultiplier: 1,
    diceRoll: 3,
    marketOutcome: 'Bullish',
    vixLevel: 18,
    ...overrides,
  };
}

// ─── Turn Result Factory ───────────────────────────────────

export function createMockTurnResult(overrides: Partial<TurnResult> = {}): TurnResult {
  return {
    playerId: mockId(),
    gameId: mockId(),
    turnNumber: 1,
    previousPosition: 1,
    newPosition: 4,
    spacesMovedRaw: 3,
    previousCapital: 100,
    capitalDelta: 0,
    finalCapital: 100,
    tileEffect: null,
    tileName: null,
    appliedModifiers: [],
    isStunned: false,
    isMarginCall: false,
    isGameWon: false,
    diceRoll: 3,
    declaredView: 'Bullish',
    marketOutcome: 'Bullish',
    viewMatched: true,
    convictionMultiplier: 1,
    gammaMultiplier: 1.5,
    thetaApplied: false,
    vixLevel: 18,
    vixPenaltyApplied: false,
    ...overrides,
  };
}

// ─── VIX Factory ───────────────────────────────────────────

export function createMockVIXLevel(overrides: Partial<VIXLevel> = {}): VIXLevel {
  return {
    value: 18,
    timestamp: Date.now(),
    regime: 'normal',
    ...overrides,
  };
}

// ─── Quest Factory ─────────────────────────────────────────

export function createMockQuest(overrides: Partial<DailyQuest> = {}): DailyQuest {
  return {
    id: mockId(),
    title: 'Mock Quest',
    description: 'Complete a mock objective.',
    targetValue: 5,
    currentProgress: 0,
    reward: { capitalBonus: 5, description: '+5% Capital bonus' },
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    isCompleted: false,
    questType: 'survive_turns',
    ...overrides,
  };
}

// ─── Game State Snapshot Factory ───────────────────────────

export function createMockGameState(
  overrides: Partial<GameStateSnapshot> = {},
): GameStateSnapshot {
  const player = createMockPlayer();
  return {
    gameId: mockId(),
    players: [player],
    currentTurnPlayerId: player.id,
    turnNumber: 1,
    turnPhase: TurnPhase.AWAITING_VIEW,
    vixLevel: 18,
    marketTrend: 'Sideways',
    activeQuests: [],
    ...overrides,
  };
}

// ─── Lobby Room Factory ────────────────────────────────────

export function createMockRoom(overrides: Partial<LobbyRoomInfo> = {}): LobbyRoomInfo {
  const hostId = mockId();
  return {
    id: mockId(),
    name: 'Mock Room',
    hostId,
    hostName: 'Host Player',
    players: [{ id: hostId, name: 'Host Player', isBot: false }],
    maxPlayers: 4,
    gameMode: 'Multiplayer',
    status: 'waiting',
    ...overrides,
  };
}
