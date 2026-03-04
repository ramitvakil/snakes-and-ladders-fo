import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@game/shared';
import { useAuthStore } from '../stores/authStore';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * WebSocket URL: prefer VITE_WS_URL (direct to server) over VITE_API_URL (may go through Vite proxy).
 * Direct connection avoids Vite proxy issues with Socket.IO namespaces.
 */
const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || '';

/**
 * Create a typed Socket.IO connection for a given namespace.
 * Attaches the JWT token from auth store on each connection.
 */
function createSocket(namespace: string): TypedSocket {
  const socket = io(`${WS_URL}${namespace}`, {
    autoConnect: false,
    auth: (cb) => {
      const token = useAuthStore.getState().token;
      cb({ token });
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
  });

  return socket as TypedSocket;
}

// ── Singleton socket instances ──
export const gameSocket = createSocket('/game');
export const marketSocket = createSocket('/market');
export const lobbySocket = createSocket('/lobby');

/**
 * Connect all sockets.
 */
export function connectAll(): void {
  gameSocket.connect();
  marketSocket.connect();
  lobbySocket.connect();
}

/**
 * Disconnect all sockets.
 */
export function disconnectAll(): void {
  gameSocket.disconnect();
  marketSocket.disconnect();
  lobbySocket.disconnect();
}
