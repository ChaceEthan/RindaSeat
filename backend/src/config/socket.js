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
  const localDevOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

  if (!isProductionRuntime() && (configuredOrigins.length === 0 || configuredOrigins.includes('*'))) {
    return '*';
  }

  return [...new Set([
    ...configuredOrigins.filter((origin) => origin !== '*'),
    ...(!isProductionRuntime() ? localDevOrigins : []),
    'https://rindaseat.vercel.app',
    'https://rinda-seat.vercel.app'
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

    socket.on('joinDriverTrip', (tripId) => {
      if (tripId) {
        socket.join(`trip:${tripId}`);
        socket.join(`driver:${tripId}`);
      }
    });

    socket.on('leaveTripRoom', (tripId) => {
      if (tripId) {
        socket.leave(`trip:${tripId}`);
        socket.leave(`driver:${tripId}`);
      }
    });

    socket.on('driver-location', (payload = {}) => {
      if (payload.tripId) {
        io.to(`trip:${payload.tripId}`).emit('driver-location', {
          ...payload,
          updatedAt: payload.updatedAt || new Date().toISOString()
        });
      }
    });

    socket.on('passenger-pickup-marker', (payload = {}) => {
      if (payload.tripId) {
        io.to(`trip:${payload.tripId}`).emit('passenger-pickup-marker', {
          ...payload,
          updatedAt: payload.updatedAt || new Date().toISOString()
        });
      }
    });

    socket.on('seat-inventory', (payload = {}) => {
      if (payload.tripId) {
        io.to(`trip:${payload.tripId}`).emit('seat-inventory', {
          ...payload,
          updatedAt: payload.updatedAt || new Date().toISOString()
        });
      }
    });

    socket.on('boarding-confirmation', (payload = {}) => {
      if (payload.tripId) {
        io.to(`trip:${payload.tripId}`).emit('boarding-confirmation', {
          ...payload,
          updatedAt: payload.updatedAt || new Date().toISOString()
        });
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
