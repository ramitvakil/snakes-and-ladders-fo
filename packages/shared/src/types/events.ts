import type { MarketView, Player, BotDifficulty } from './player';
import type { TurnResult } from './turn';
import type { VIXLevel, DailyQuest, QuestLogEntry, NewsItem } from './market';
import type { TurnPhase } from './turn';

// ─── Socket.IO Typed Event Maps ────────────────────────────

/**
 * Events emitted FROM the server TO the client
 */
export interface ServerToClientEvents {
  // ─── Game namespace (/game) ───
  'game:turnResult': (result: TurnResult) => void;
  'game:playerUpdate': (player: Partial<Player> & { id: string }) => void;
  'game:phaseChange': (data: { phase: TurnPhase; playerId: string }) => void;
  'game:gameOver': (data: { winnerId: string | null; reason: string; finalStandings: GameStanding[] }) => void;
  'game:stunned': (data: { playerId: string; turnsRemaining: number }) => void;
  'game:marginCall': (data: { playerId: string }) => void;
  'game:error': (data: { message: string; code: string }) => void;
  'game:stateSync': (state: GameStateSnapshot) => void;

  // ─── Market namespace (/market) ───
  'market:vixUpdate': (vix: VIXLevel) => void;
  'market:dailyQuest': (quest: DailyQuest) => void;
  'market:questLog': (entry: QuestLogEntry) => void;
  'market:trendUpdate': (trend: MarketView) => void;
  'market:news': (item: NewsItem) => void;

  // ─── Lobby namespace (/lobby) ───
  'lobby:roomCreated': (room: LobbyRoomInfo) => void;
  'lobby:roomUpdated': (room: LobbyRoomInfo) => void;
  'lobby:roomRemoved': (data: { roomId: string }) => void;
  'lobby:gameStarted': (data: { gameId: string; roomId: string }) => void;
  'lobby:playerJoined': (data: { roomId: string; player: { id: string; displayName: string; isBot?: boolean } }) => void;
  'lobby:playerLeft': (data: { roomId: string; playerId: string; displayName: string }) => void;
  'lobby:error': (data: { message: string }) => void;
  'lobby:roomList': (rooms: LobbyRoomInfo[]) => void;

  // ─── Game lifecycle events (emitted by GameManager to /game room) ───
  'game:started': (data: { gameId: string; players: Player[]; vixLevel: any }) => void;
  'game:ended': (data: { gameId: string; winnerId: string | null; finalStandings: any[] }) => void;
  'game:playerJoined': (data: { gameId: string; playerId: string; displayName: string }) => void;
  'game:playerLeft': (data: { gameId: string; playerId: string; displayName: string }) => void;
}

/**
 * Events emitted FROM the client TO the server
 */
export interface ClientToServerEvents {
  // ─── Game namespace (/game) ───
  'game:joinGame': (data: { gameId: string }, ack: (success: boolean) => void) => void;
  'game:setView': (data: { gameId: string; view: MarketView }) => void;
  'game:setConviction': (data: { gameId: string; conviction: number }) => void;
  'game:rollDice': (data: { gameId: string }) => void;
  'game:endTurn': (data: { gameId: string }) => void;
  'game:requestSync': (data: { gameId: string }) => void;

  // ─── Market namespace (/market) ───
  'market:subscribe': (data: { tier: string }) => void;
  'market:acceptQuest': (data: { questId: string }) => void;

  // ─── Lobby namespace (/lobby) ───
  'lobby:createRoom': (data: { name: string; maxPlayers: number; gameMode: GameMode }) => void;
  'lobby:joinRoom': (data: { roomId: string }) => void;
  'lobby:leaveRoom': (data: { roomId: string }) => void;
  'lobby:startGame': (data: { roomId: string }) => void;
  'lobby:addBot': (data: { roomId: string; difficulty: BotDifficulty }) => void;
  'lobby:listRooms': () => void;
}

/**
 * Events between Socket.IO server instances (multi-process with Redis adapter)
 */
export interface InterServerEvents {
  'internal:gameStateSync': (gameId: string, state: GameStateSnapshot) => void;
}

// ─── Supporting Types for Events ───────────────────────────

export type GameMode = 'SinglePlayer' | 'Multiplayer';

export interface GameStanding {
  playerId: string;
  playerName: string;
  finalPosition: number;
  finalCapital: number;
  turnsPlayed: number;
  isBot: boolean;
}

export interface GameStateSnapshot {
  gameId: string;
  players: Player[];
  currentTurnPlayerId: string;
  turnNumber: number;
  turnPhase: TurnPhase;
  vixLevel: number;
  marketTrend: MarketView;
  activeQuests: DailyQuest[];
}

export interface LobbyRoomInfo {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  players: Array<{ id: string; name: string; isBot: boolean }>;
  maxPlayers: number;
  gameMode: GameMode;
  status: 'waiting' | 'starting' | 'in_game';
}
