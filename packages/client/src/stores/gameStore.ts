import { create } from 'zustand';
import type { Player, TurnResult, VIXLevel, MarketView, ConvictionLevel } from '@game/shared';

export interface GameStoreState {
  // Game metadata
  gameId: string | null;
  mode: 'SinglePlayer' | 'Multiplayer' | null;
  status: 'idle' | 'waiting' | 'in_progress' | 'completed';
  currentTurn: number;

  // Players
  players: Player[];
  currentPlayerId: string | null;
  myPlayerId: string | null;
  isMyTurn: boolean;

  // Turn state
  selectedView: MarketView | null;
  selectedConviction: ConvictionLevel | null;
  lastTurnResult: TurnResult | null;
  myLastTurnResult: TurnResult | null;
  turnHistory: TurnResult[];
  isRolling: boolean;

  // VIX
  vixLevel: VIXLevel | null;

  // Winner
  winnerId: string | null;

  // Actions
  initGame: (gameId: string, mode: 'SinglePlayer' | 'Multiplayer', players: Player[], myPlayerId: string) => void;
  setView: (view: MarketView) => void;
  setConviction: (conviction: ConvictionLevel) => void;
  setRolling: (rolling: boolean) => void;
  applyTurnResult: (result: TurnResult) => void;
  updateVIX: (vix: VIXLevel) => void;
  updatePlayers: (players: Player[]) => void;
  setGameOver: (winnerId: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameId: null,
  mode: null,
  status: 'idle',
  currentTurn: 0,
  players: [],
  currentPlayerId: null,
  myPlayerId: null,
  isMyTurn: false,
  selectedView: null,
  selectedConviction: null,
  lastTurnResult: null,
  myLastTurnResult: null,
  turnHistory: [],
  isRolling: false,
  vixLevel: null,
  winnerId: null,

  initGame: (gameId, mode, players, myPlayerId) =>
    set({
      gameId,
      mode,
      status: 'in_progress',
      players,
      myPlayerId,
      currentPlayerId: players[0]?.id ?? null,
      isMyTurn: players[0]?.id === myPlayerId,
      currentTurn: 1,
      turnHistory: [],
      lastTurnResult: null,
      myLastTurnResult: null,
      winnerId: null,
    }),

  setView: (view) => set({ selectedView: view }),

  setConviction: (conviction) => set({ selectedConviction: conviction }),

  setRolling: (rolling) => set({ isRolling: rolling }),

  applyTurnResult: (result) => {
    const state = get();
    const updatedPlayers = state.players.map((p) => {
      if (p.id !== result.playerId) return p;
      return {
        ...p,
        position: result.newPosition,
        capital: result.finalCapital,
        isMarginCalled: result.isMarginCall,
        stunTurns: result.isStunned ? 2 : Math.max(0, p.stunTurns - 1),
      };
    });

    // Advance to next player
    const currentIdx = updatedPlayers.findIndex((p) => p.id === result.playerId);
    let nextIdx = (currentIdx + 1) % updatedPlayers.length;

    // Skip margin-called players
    let attempts = 0;
    while (updatedPlayers[nextIdx]?.isMarginCalled && attempts < updatedPlayers.length) {
      nextIdx = (nextIdx + 1) % updatedPlayers.length;
      attempts++;
    }

    const nextPlayerId = updatedPlayers[nextIdx]?.id ?? null;
    const newTurn = nextIdx <= currentIdx ? state.currentTurn + 1 : state.currentTurn;

    set({
      players: updatedPlayers,
      lastTurnResult: result,
      ...(result.playerId === state.myPlayerId ? { myLastTurnResult: result } : {}),
      turnHistory: [...state.turnHistory, result],
      isRolling: false,
      selectedView: null,
      selectedConviction: null,
      currentPlayerId: nextPlayerId,
      currentTurn: newTurn,
      isMyTurn: nextPlayerId === state.myPlayerId,
      ...(result.isGameWon ? { status: 'completed', winnerId: result.playerId } : {}),
    });
  },

  updateVIX: (vix) => set({ vixLevel: vix }),

  updatePlayers: (players) => set({ players }),

  setGameOver: (winnerId) =>
    set({
      status: 'completed',
      winnerId,
    }),

  resetGame: () =>
    set({
      gameId: null,
      mode: null,
      status: 'idle',
      currentTurn: 0,
      players: [],
      currentPlayerId: null,
      myPlayerId: null,
      isMyTurn: false,
      selectedView: null,
      selectedConviction: null,
      lastTurnResult: null,
      myLastTurnResult: null,
      turnHistory: [],
      isRolling: false,
      vixLevel: null,
      winnerId: null,
    }),
}));
