import { create } from 'zustand';

export interface LobbyPlayer {
  userId: string;
  displayName: string;
  isBot: boolean;
}

export interface LobbyRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  players: LobbyPlayer[];
  maxPlayers: number;
  playerCount: number;
  mode: string;
}

interface LobbyState {
  rooms: LobbyRoom[];
  currentRoom: LobbyRoom | null;
  isConnected: boolean;

  setRooms: (rooms: LobbyRoom[]) => void;
  setCurrentRoom: (room: LobbyRoom | null) => void;
  addPlayerToRoom: (roomId: string, player: LobbyPlayer) => void;
  removePlayerFromRoom: (roomId: string, userId: string) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: [],
  currentRoom: null,
  isConnected: false,

  setRooms: (rooms) => set({ rooms }),

  setCurrentRoom: (room) => set({ currentRoom: room }),

  addPlayerToRoom: (roomId, player) =>
    set((state) => {
      const rooms = state.rooms.map((r) =>
        r.id === roomId
          ? { ...r, players: [...r.players, player], playerCount: r.playerCount + 1 }
          : r,
      );
      const currentRoom =
        state.currentRoom?.id === roomId
          ? {
              ...state.currentRoom,
              players: [...state.currentRoom.players, player],
              playerCount: state.currentRoom.playerCount + 1,
            }
          : state.currentRoom;
      return { rooms, currentRoom };
    }),

  removePlayerFromRoom: (roomId, userId) =>
    set((state) => {
      const rooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              players: r.players.filter((p) => p.userId !== userId),
              playerCount: r.playerCount - 1,
            }
          : r,
      );
      const currentRoom =
        state.currentRoom?.id === roomId
          ? {
              ...state.currentRoom,
              players: state.currentRoom.players.filter((p) => p.userId !== userId),
              playerCount: state.currentRoom.playerCount - 1,
            }
          : state.currentRoom;
      return { rooms, currentRoom };
    }),

  setConnected: (connected) => set({ isConnected: connected }),

  reset: () => set({ rooms: [], currentRoom: null, isConnected: false }),
}));
