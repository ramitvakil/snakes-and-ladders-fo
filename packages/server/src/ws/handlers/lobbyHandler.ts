import type { Server, Socket } from 'socket.io';
import { CreateRoomInputSchema, AddBotInputSchema } from '@game/shared';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  LobbyRoomInfo,
  GameMode,
  BotDifficulty,
} from '@game/shared';
import type { GameManager } from '../../services/GameManager.js';
import { createChildLogger } from '../../config/logger.js';

type LobbyIO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
type LobbySocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

const log = createChildLogger('ws:lobby');

interface InternalPlayer {
  userId: string;
  displayName: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
}

interface InternalRoom {
  id: string;
  name: string;
  host: string;
  hostName: string;
  players: InternalPlayer[];
  maxPlayers: number;
  mode: GameMode;
}

/** Convert internal room to the LobbyRoomInfo shape the client expects */
function toRoomInfo(room: InternalRoom): LobbyRoomInfo {
  return {
    id: room.id,
    name: room.name,
    hostId: room.host,
    hostName: room.hostName,
    players: room.players.map((p) => ({ id: p.userId, name: p.displayName, isBot: p.isBot })),
    maxPlayers: room.maxPlayers,
    gameMode: room.mode,
    status: 'waiting',
  };
}

// In-memory lobby rooms
const lobbyRooms = new Map<string, InternalRoom>();

/**
 * Handles lobby-related socket events on the /lobby namespace.
 */
export function registerLobbyHandler(io: LobbyIO, socket: LobbySocket, gameManager: GameManager) {

  /** Require authenticated socket for mutating operations. */
  function requireAuth(): boolean {
    if (!socket.user?.userId) {
      log.warn({ socketId: socket.id }, 'Unauthenticated socket attempted mutating lobby action');
      socket.emit('lobby:error', {
        message: 'Authentication required. Please log in again.',
      });
      return false;
    }
    return true;
  }

  /**
   * lobby:createRoom – Host creates a new game room.
   */
  socket.on('lobby:createRoom', (data) => {
    if (!requireAuth()) return;

    try {
      const parsed = CreateRoomInputSchema.parse(data);
      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const userId = socket.user!.userId;
      const displayName = socket.user!.displayName;

      const room: InternalRoom = {
        id: roomId,
        name: parsed.name ?? `${displayName}'s room`,
        host: userId,
        hostName: displayName,
        players: [
          {
            userId,
            displayName,
            isBot: false,
          },
        ],
        maxPlayers: parsed.maxPlayers ?? 4,
        mode: parsed.gameMode,
      };

      lobbyRooms.set(roomId, room);
      socket.join(`lobby:${roomId}`);

      const info = toRoomInfo(room);

      // Tell the creator about their new room
      socket.emit('lobby:roomCreated' as any, info);

      // Broadcast full room list to everyone
      io.emit('lobby:roomList', Array.from(lobbyRooms.values()).map(toRoomInfo) as any);

      log.info({ userId: socket.user!.userId, roomId }, 'Room created');

      // ── Auto-setup for SinglePlayer: add a bot and start automatically ──
      if (parsed.gameMode === 'SinglePlayer') {
        const botId = `bot_${Date.now()}`;
        const botName = 'Bot_adaptive_1';
        room.players.push({
          userId: botId,
          displayName: botName,
          isBot: true,
          botDifficulty: 'adaptive' as BotDifficulty,
        });

        io.to(`lobby:${roomId}`).emit('lobby:playerJoined', {
          roomId,
          player: { id: botId, displayName: botName, isBot: true },
        } as any);
        io.to(`lobby:${roomId}`).emit('lobby:roomUpdated' as any, toRoomInfo(room));

        // Small delay so the client receives the room events before game start
        setTimeout(async () => {
          try {
            const gameId = await gameManager.createGame(room.host, room.hostName, room.mode);
            for (const player of room.players) {
              if (player.userId === room.host) continue;
              if (player.isBot) {
                await gameManager.addBot(gameId, player.botDifficulty ?? 'adaptive');
              }
            }
            await gameManager.startGame(gameId);
            io.to(`lobby:${roomId}`).emit('lobby:gameStarted', { roomId, gameId } as any);
            lobbyRooms.delete(roomId);
            log.info({ roomId, gameId }, 'SinglePlayer auto-started');
          } catch (err) {
            log.error({ err, roomId }, 'SinglePlayer auto-start failed');
            socket.emit('lobby:error', { message: 'Failed to auto-start game' });
          }
        }, 500);
      }
    } catch (err) {
      log.warn({ err, socketId: socket.id }, 'Invalid createRoom payload');
      socket.emit('lobby:error', { message: 'Invalid room data' });
    }
  });

  /**
   * lobby:joinRoom – Player joins an existing room.
   */
  socket.on('lobby:joinRoom', (data) => {
    if (!requireAuth()) return;

    const { roomId } = data as { roomId: string };
    const room = lobbyRooms.get(roomId);

    if (!room) {
      socket.emit('lobby:error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('lobby:error', { message: 'Room is full' });
      return;
    }

    const userId = socket.user!.userId;
    const displayName = socket.user!.displayName;

    room.players.push({
      userId,
      displayName,
      isBot: false,
    });

    socket.join(`lobby:${roomId}`);

    // Send room info to the joiner
    socket.emit('lobby:roomUpdated' as any, toRoomInfo(room));

    // Notify everyone in the room
    io.to(`lobby:${roomId}`).emit('lobby:playerJoined', {
      roomId,
      player: {
        id: userId,
        displayName,
        isBot: false,
      },
    } as any);

    // Broadcast updated room list
    io.emit('lobby:roomList', Array.from(lobbyRooms.values()).map(toRoomInfo) as any);

    log.info({ userId, roomId }, 'Player joined room');
  });

  /**
   * lobby:addBot – Host adds a bot to the room.
   */
  socket.on('lobby:addBot', (data) => {
    if (!requireAuth()) return;

    try {
      const parsed = AddBotInputSchema.parse(data);
      const room = lobbyRooms.get(parsed.roomId);

      if (!room) {
        socket.emit('lobby:error', { message: 'Room not found' });
        return;
      }

      if (room.host !== socket.user?.userId) {
        socket.emit('lobby:error', { message: 'Only host can add bots' });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('lobby:error', { message: 'Room is full' });
        return;
      }

      const botId = `bot_${Date.now()}`;
      const botName = `Bot_${parsed.difficulty}_${room.players.filter((p) => p.isBot).length + 1}`;
      room.players.push({
        userId: botId,
        displayName: botName,
        isBot: true,
        botDifficulty: parsed.difficulty as BotDifficulty,
      });

      // Notify room members
      io.to(`lobby:${parsed.roomId}`).emit('lobby:playerJoined', {
        roomId: parsed.roomId,
        player: { id: botId, displayName: botName, isBot: true },
      } as any);

      // Send updated room info so UI refreshes
      io.to(`lobby:${parsed.roomId}`).emit('lobby:roomUpdated' as any, toRoomInfo(room));

      // Broadcast updated list
      io.emit('lobby:roomList', Array.from(lobbyRooms.values()).map(toRoomInfo) as any);

      log.info({ roomId: parsed.roomId, botName, difficulty: parsed.difficulty }, 'Bot added');
    } catch (err) {
      log.warn({ err, socketId: socket.id }, 'Invalid addBot payload');
      socket.emit('lobby:error', { message: 'Invalid bot data' });
    }
  });

  /**
   * lobby:startGame – Host starts the game.
   */
  socket.on('lobby:startGame', async (data) => {
    if (!requireAuth()) return;

    const { roomId } = data as { roomId: string };
    const room = lobbyRooms.get(roomId);

    if (!room) {
      socket.emit('lobby:error', { message: 'Room not found' });
      return;
    }

    if (room.host !== socket.user?.userId) {
      socket.emit('lobby:error', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('lobby:error', { message: 'Need at least 2 players' });
      return;
    }

    try {
      // Create actual game via GameManager
      const gameId = await gameManager.createGame(room.host, room.hostName, room.mode);

      // Add non-host players
      for (const player of room.players) {
        if (player.userId === room.host) continue;
        if (player.isBot) {
          await gameManager.addBot(gameId, player.botDifficulty ?? 'adaptive');
        } else {
          await gameManager.joinGame(gameId, player.userId, player.displayName);
        }
      }

      // Start the game engine
      await gameManager.startGame(gameId);

      // Notify room members with the real game ID
      io.to(`lobby:${roomId}`).emit('lobby:gameStarted', {
        roomId,
        gameId,
      } as any);

      lobbyRooms.delete(roomId);
      log.info({ roomId, gameId, playerCount: room.players.length }, 'Game created and started from lobby');
    } catch (err) {
      log.error({ err, roomId }, 'Failed to start game');
      socket.emit('lobby:error', { message: 'Failed to start game. Please try again.' });
    }
  });

  /**
   * lobby:listRooms – Request current room list.
   */
  socket.on('lobby:listRooms', () => {
    socket.emit('lobby:roomList', Array.from(lobbyRooms.values()).map(toRoomInfo) as any);
  });

  socket.on('disconnect', () => {
    // Clean up: remove player from any rooms they were in
    for (const [roomId, room] of lobbyRooms) {
      const idx = room.players.findIndex((p) => p.userId === socket.user?.userId);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(`lobby:${roomId}`).emit('lobby:playerLeft', {
          roomId,
          playerId: socket.user?.userId ?? 'unknown',
          displayName: socket.user?.displayName ?? 'Unknown',
        } as any);

        // Remove room if empty
        if (room.players.length === 0) {
          lobbyRooms.delete(roomId);
          io.emit('lobby:roomRemoved' as any, { roomId });
        } else if (room.host === socket.user?.userId) {
          // Transfer host
          room.host = room.players[0]!.userId;
          room.hostName = room.players[0]!.displayName;
        }
      }
    }
    log.debug({ userId: socket.user?.userId }, 'Lobby socket disconnected');
  });
}
