import { io } from 'socket.io-client';
import { IS_PRODUCTION, SOCKET_ENABLED, SOCKET_URL } from '../config/environment';

let socket;
let disabledUntil = 0;

const SOCKET_COOLDOWN_MS = 60_000;

export const getSocket = () => {
  if (!SOCKET_ENABLED) {
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: IS_PRODUCTION ? ['websocket', 'polling'] : ['websocket', 'polling'],
      reconnection: false,
      timeout: 3000,
      secure: SOCKET_URL.startsWith('https://'),
      withCredentials: true
    });

    socket.on('connect_error', () => {
      disabledUntil = Date.now() + SOCKET_COOLDOWN_MS;
      socket.disconnect();
    });
  }

  return socket;
};

export const connectSocket = () => {
  const activeSocket = getSocket();

  if (!activeSocket) {
    return null;
  }

  if (!activeSocket.connected && Date.now() > disabledUntil) {
    activeSocket.connect();
  }

  return activeSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export { SOCKET_URL };
