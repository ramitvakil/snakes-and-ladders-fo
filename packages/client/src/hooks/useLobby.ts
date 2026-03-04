import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { lobbySocket } from '../socket/client';
import { useSocket } from './useSocket';
import { useLobbyStore, type LobbyRoom } from '../stores/lobbyStore';
import { useUIStore } from '../stores/uiStore';
import type { LobbyRoomInfo, BotDifficulty } from '@game/shared';

function toLobbyRoom(info: LobbyRoomInfo): LobbyRoom {
  return {
    id: info.id,
    name: info.name,
    hostId: info.hostId,
    hostName: info.hostName,
    players: info.players.map((p) => ({ userId: p.id, displayName: p.name, isBot: p.isBot })),
    maxPlayers: info.maxPlayers,
    playerCount: info.players.length,
    mode: info.gameMode,
  };
}

/**
 * Hook that manages the /lobby socket namespace.
 */
export function useLobby(enabled = true) {
  const socket = useSocket(lobbySocket, enabled);
  const notify = useUIStore.getState().addNotification;
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const onRoomList = (rooms: LobbyRoomInfo[]) => {
      useLobbyStore.getState().setRooms(rooms.map(toLobbyRoom));
    };

    const onRoomCreated = (room: LobbyRoomInfo) => {
      const store = useLobbyStore.getState();
      const lobbyRoom = toLobbyRoom(room);
      store.setRooms([...store.rooms, lobbyRoom]);
      // Auto-set as current room for the creator
      store.setCurrentRoom(lobbyRoom);
    };

    const onRoomUpdated = (room: LobbyRoomInfo) => {
      const store = useLobbyStore.getState();
      const lobbyRoom = toLobbyRoom(room);
      store.setRooms(store.rooms.map((r) => (r.id === room.id ? lobbyRoom : r)));
      // Update current room if it's the same one
      if (store.currentRoom?.id === room.id) {
        store.setCurrentRoom(lobbyRoom);
      }
    };

    const onRoomRemoved = (data: { roomId: string }) => {
      const store = useLobbyStore.getState();
      store.setRooms(store.rooms.filter((r) => r.id !== data.roomId));
    };

    const onPlayerJoinedRoom = (data: { roomId: string; player: { id: string; displayName: string; isBot?: boolean } }) => {
      const store = useLobbyStore.getState();
      const player = {
        userId: data.player.id,
        displayName: data.player.displayName,
        isBot: data.player.isBot ?? false,
      };
      store.addPlayerToRoom(data.roomId, player);
      notify('info', `${data.player.displayName} joined the room`);
    };

    const onPlayerLeftRoom = (data: { roomId: string; playerId: string; displayName: string }) => {
      useLobbyStore.getState().removePlayerFromRoom(data.roomId, data.playerId);
      notify('info', `${data.displayName} left the room`);
    };

    const onGameStarted = (data: { gameId: string; roomId: string }) => {
      useLobbyStore.getState().setCurrentRoom(null);
      notify('info', `Game starting! ID: ${data.gameId}`);
      // Navigate to the game page
      navigate(`/game/${data.gameId}`);
    };

    const onError = (data: { message: string }) => {
      notify('error', data.message);
    };

    socket.on('lobby:roomList', onRoomList);
    socket.on('lobby:roomCreated', onRoomCreated);
    socket.on('lobby:roomUpdated', onRoomUpdated);
    socket.on('lobby:roomRemoved', onRoomRemoved);
    socket.on('lobby:playerJoined', onPlayerJoinedRoom);
    socket.on('lobby:playerLeft', onPlayerLeftRoom);
    socket.on('lobby:gameStarted', onGameStarted);
    socket.on('lobby:error', onError);

    // Fetch current rooms on connect
    socket.emit('lobby:listRooms' as any);

    return () => {
      socket.off('lobby:roomList', onRoomList);
      socket.off('lobby:roomCreated', onRoomCreated);
      socket.off('lobby:roomUpdated', onRoomUpdated);
      socket.off('lobby:roomRemoved', onRoomRemoved);
      socket.off('lobby:playerJoined', onPlayerJoinedRoom);
      socket.off('lobby:playerLeft', onPlayerLeftRoom);
      socket.off('lobby:gameStarted', onGameStarted);
      socket.off('lobby:error', onError);
    };
  }, [socket, enabled, notify, navigate]);

  // ── Actions ──
  const createRoom = useCallback(
    (name: string, maxPlayers: number, gameMode: 'SinglePlayer' | 'Multiplayer' = 'Multiplayer') => {
      socket.emit('lobby:createRoom', { name, maxPlayers, gameMode });
    },
    [socket],
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      socket.emit('lobby:joinRoom', { roomId });
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      socket.emit('lobby:leaveRoom', { roomId });
      useLobbyStore.getState().setCurrentRoom(null);
    },
    [socket],
  );

  const addBot = useCallback(
    (roomId: string, difficulty: BotDifficulty) => {
      socket.emit('lobby:addBot', { roomId, difficulty });
    },
    [socket],
  );

  const startGame = useCallback(
    (roomId: string) => {
      socket.emit('lobby:startGame', { roomId });
    },
    [socket],
  );

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    addBot,
    startGame,
    rooms: useLobbyStore((s) => s.rooms),
    currentRoom: useLobbyStore((s) => s.currentRoom),
  };
}
