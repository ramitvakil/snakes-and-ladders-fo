import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { gameSocket } from '../socket/client';
import { useSocket } from './useSocket';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type {
  GameStateSnapshot,
  TurnResult,
  MarketView,
  ConvictionLevel,
} from '@game/shared';

/**
 * Hook that wires the /game socket to the game store.
 * Returns action functions for the UI to call.
 */
export function useGame(enabled = true) {
  const socket = useSocket(gameSocket, enabled);
  const store = useGameStore;
  const notify = useUIStore.getState().addNotification;
  const { gameId: routeGameId } = useParams<{ gameId: string }>();

  // ── Listen to server events ──
  useEffect(() => {
    if (!enabled) return;

    const onStateSync = (snapshot: GameStateSnapshot) => {
      const myId = useAuthStore.getState().user?.id ?? '';
      store.getState().initGame(
        snapshot.gameId,
        'Multiplayer',
        snapshot.players,
        myId,
      );
      // Set the current player based on the snapshot
      store.setState({
        currentPlayerId: snapshot.currentTurnPlayerId,
        isMyTurn: snapshot.currentTurnPlayerId === myId,
        currentTurn: snapshot.turnNumber,
      });
    };

    const onTurnResult = (result: TurnResult) => {
      store.getState().applyTurnResult(result);

      // ── Rich toast notifications for turn events ──
      const myId = useAuthStore.getState().user?.id ?? '';
      const isMe = result.playerId === myId;
      const playerName = store.getState().players.find((p) => p.id === result.playerId)?.displayName ?? 'Player';
      const prefix = isMe ? 'You' : playerName;

      if (result.isMarginCall) {
        notify('error', `${prefix} got margin called! Capital wiped out.`);
      } else if (result.isStunned) {
        notify('warning', `${prefix} stunned for 2 turns — large loss!`);
      } else if (result.tileEffect?.name) {
        const delta = result.capitalDelta;
        const sign = delta >= 0 ? '+' : '';
        notify(delta >= 0 ? 'success' : 'warning', `⚡ ${result.tileName ?? result.tileEffect.name} (${sign}₹${Math.abs(delta).toFixed(0)})`);
      }

      if (isMe && (result.gammaMultiplier ?? 1) > 1) {
        notify('success', `🔥 Gamma Boost active — ${result.gammaMultiplier}x multiplier!`);
      }

      if (isMe && result.vixPenaltyApplied) {
        notify('warning', `📉 Vega penalty applied — VIX at ${result.vixLevel.toFixed(1)}`);
      }

      if (result.isGameWon) {
        notify('success', `🏆 ${prefix} reached tile 100 and won!`);
      }
    };

    const onGameOver = (data: { winnerId: string | null; reason: string }) => {
      store.setState({ winnerId: data.winnerId, status: 'completed' });
      notify('info', `Game over! ${data.reason}`);
    };

    const onError = (data: { message: string }) => {
      store.getState().setRolling(false);
      notify('error', data.message);
    };

    socket.on('game:stateSync', onStateSync);
    socket.on('game:turnResult', onTurnResult);
    socket.on('game:gameOver', onGameOver);
    socket.on('game:error', onError);

    // Join the game room when mounting
    if (routeGameId) {
      socket.emit('game:joinGame', { gameId: routeGameId } as any);
    }

    return () => {
      socket.off('game:stateSync', onStateSync);
      socket.off('game:turnResult', onTurnResult);
      socket.off('game:gameOver', onGameOver);
      socket.off('game:error', onError);
    };
  }, [socket, enabled, notify, store, routeGameId]);

  // ── Actions ──
  const setView = useCallback(
    (view: MarketView) => {
      const gameId = store.getState().gameId;
      store.getState().setView(view);
      socket.emit('game:setView', { gameId, view } as any);
    },
    [socket, store],
  );

  const setConviction = useCallback(
    (level: ConvictionLevel) => {
      const gameId = store.getState().gameId;
      store.getState().setConviction(level);
      socket.emit('game:setConviction', { gameId, conviction: level } as any);
    },
    [socket, store],
  );

  const rollDice = useCallback(() => {
    const gameId = store.getState().gameId;
    store.getState().setRolling(true);
    socket.emit('game:rollDice', { gameId } as any);
  }, [socket, store]);

  return {
    setView,
    setConviction,
    rollDice,
    isMyTurn: useGameStore((s) => s.isMyTurn),
    isRolling: useGameStore((s) => s.isRolling),
    status: useGameStore((s) => s.status),
  };
}
