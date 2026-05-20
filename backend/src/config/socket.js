// @ts-nocheck
const { Server } = require('socket.io');

let io;

const isProductionRuntime = () => process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

const splitOrigins = (value = '') => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const getAllowedOrigins = () => {
  const configuredOrigins = [
    ...splitOrigins(process.env.SOCKET_CORS_ORIGIN),
    ...splitOrigins(process.env.CLIENT_URL),
    ...splitOrigins(process.env.CLIENT_ORIGIN),
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.CORS_ORIGINS)
  ];

  if (!isProductionRuntime() && (configuredOrigins.length === 0 || configuredOrigins.includes('*'))) {
    return '*';
  }

  return [...new Set([
    ...configuredOrigins.filter((origin) => origin !== '*'),
    'https://rindaseat.vercel.app'
  ])];
};

const isPreviewOriginAllowed = (origin) => {
  if (process.env.ALLOW_VERCEL_PREVIEW_ORIGINS !== 'true') {
    return false;
  }

  try {
    return new URL(origin).hostname.endsWith('.vercel.app');
  } catch (error) {
    return false;
  }
};

const socketOrigin = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();

  if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin) || isPreviewOriginAllowed(origin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by Socket.IO CORS'));
};

const socketLogsEnabled = () => process.env.ENABLE_SOCKET_LOGS === 'true';

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: socketOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
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
