import type { BotDifficulty } from './player';
import type { GameMode } from './events';

// ─── Lobby Types ───────────────────────────────────────────

export interface LobbyPlayer {
  id: string;
  userId: string;
  name: string;
  isBot: boolean;
  isReady: boolean;
  botDifficulty?: BotDifficulty;
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: LobbyPlayer[];
  maxPlayers: number;
  gameMode: GameMode;
  status: 'waiting' | 'starting' | 'in_game' | 'completed';
  gameId?: string; // set once the game starts
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomRequest {
  name: string;
  maxPlayers: number;
  gameMode: GameMode;
}

export interface JoinRoomRequest {
  roomId: string;
}
