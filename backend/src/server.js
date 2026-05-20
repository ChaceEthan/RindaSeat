// @ts-nocheck
require('dotenv').config();

const http = require('http');
const { validateEnv } = require('./utils/envValidator');
const app = require('./app');
const { initializeSocket } = require('./config/socket');
const { initializeFirebase } = require('./config/firebase');
const { getDatabaseHost } = require('./utils/checkDatabase');
const { checkPostgresHealth } = require('./utils/postgresHealthCheck');
const { startDatabaseBootstrap } = require('./utils/databaseBootstrap');

const divider = '-'.repeat(63);
const PORT = process.env.PORT || 5000;

const validateRuntimeEnvironment = () => {
  try {
    validateEnv();
  } catch (error) {
    console.warn(`[ENV WARNING] ${error.message}`);
  }
};

const initializeRuntimeServices = async () => {
  initializeFirebase();

  const migrationResult = await startDatabaseBootstrap();
  if (!migrationResult.success) {
    console.warn(`[SERVER] Database migration warning: ${migrationResult.message}`);
  }

  const postgresHealth = await checkPostgresHealth();
  if (!postgresHealth.ok) {
    console.warn('[SERVER] PostgreSQL health is degraded. Server will keep running.');
  }

  return {
    migrationResult,
    postgresHealth
  };
};

const startServer = async () => {
  validateRuntimeEnvironment();

  console.log(`\n${divider}`);
  console.log('  RindaSeat Backend Startup');
  console.log(divider);
  console.log(`[ENV] Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[ENV] App: ${process.env.APP_NAME || 'RindaSeat'} v${process.env.APP_VERSION || '1.0.0'}`);
  console.log(`[DB] Host: ${getDatabaseHost()}`);

  try {
    const server = http.createServer(app);
    const io = initializeSocket(server);
    const runtimeServices = initializeRuntimeServices().catch((error) => {
      console.warn(`[SERVER] Runtime service initialization warning: ${error.message}`);

      return {
        migrationResult: {
          success: false,
          message: error.message
        },
        postgresHealth: {
          ok: false,
          degraded: true,
          error: error.message
        }
      };
    });

    console.log('[SOCKET] Socket.IO initialized');

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[SERVER] Port ${PORT} is already in use`);
        return;
      }

      console.error(`[SERVER] Runtime server error: ${error.message}`);
    });

    server.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      const runningPort = address && address.port ? address.port : PORT;
      console.log(`[SERVER] Running on port ${runningPort}`);
      console.log(`${divider}\n`);
    });

    return {
      server,
      io,
      runtimeServices
    };
  } catch (error) {
    console.error(`[SERVER] Failed to start RindaSeat backend: ${error.message}`);
    console.log(`${divider}\n`);
    return null;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer
};
