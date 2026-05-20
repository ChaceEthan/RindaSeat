import { io } from 'socket.io-client';
import { IS_PRODUCTION, SOCKET_URL } from '../config/environment';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: IS_PRODUCTION ? ['websocket', 'polling'] : ['websocket', 'polling'],
      secure: SOCKET_URL.startsWith('https://'),
      withCredentials: true
    });
  }

  return socket;
};

export const connectSocket = () => {
  const activeSocket = getSocket();

  if (!activeSocket.connected) {
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
