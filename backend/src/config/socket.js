const { Server } = require('socket.io');

let io;

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL || process.env.CLIENT_ORIGIN;

  if (!configuredOrigins || configuredOrigins === '*') {
    return '*';
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const socketLogsEnabled = () => process.env.ENABLE_SOCKET_LOGS === 'true';

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    if (socketLogsEnabled()) {
      console.log(`Socket connected: ${socket.id}`);
    }

    socket.on('joinTripRoom', (tripId) => {
      if (tripId) {
        socket.join(`trip:${tripId}`);
      }
    });

    socket.on('leaveTripRoom', (tripId) => {
      if (tripId) {
        socket.leave(`trip:${tripId}`);
      }
    });

    socket.on('disconnect', () => {
      if (socketLogsEnabled()) {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

const getSocket = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }

  return io;
};

module.exports = {
  initializeSocket,
  getSocket
};
