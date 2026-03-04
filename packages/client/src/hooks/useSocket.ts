import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';

/**
 * Manage a Socket.IO socket's lifecycle: connect on mount, disconnect on unmount,
 * and keep the UI store's connection status in sync.
 *
 * Waits for the auth store to rehydrate from localStorage before connecting,
 * so the JWT token is always available during the Socket.IO handshake.
 */
export function useSocket(socket: Socket, enabled = true): Socket {
  const mounted = useRef(true);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const setStatus = useUIStore.getState().setConnectionStatus;

    const onConnect = () => {
      if (mounted.current) setStatus('connected');
    };
    const onDisconnect = () => {
      if (mounted.current) setStatus('disconnected');
    };
    const onError = () => {
      if (mounted.current) setStatus('error');
    };
    const onReconnectAttempt = () => {
      if (mounted.current) setStatus('reconnecting');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);

    // Only connect if the auth store has a token (prevents anonymous connections).
    // The `auth` callback in client.ts reads useAuthStore.getState().token,
    // so we must wait until the token is present before calling connect().
    if (!socket.connected && token) {
      setStatus('connecting');
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.disconnect();
    };
  }, [socket, enabled, token]);

  return socket;
}
