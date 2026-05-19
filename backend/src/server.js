// @ts-nocheck
require('dotenv').config();

const http = require('http');
const { validateEnv } = require('./utils/envValidator');
const app = require('./app');
const { initializeSocket } = require('./config/socket');
const { initializeFirebase } = require('./config/firebase');
const { getDatabaseHost } = require('./utils/checkDatabase');
const { checkPostgresHealth } = require('./utils/postgresHealthCheck');

const PORT = process.env.PORT || 5000;
const divider = '-'.repeat(63);
const degradedModeAllowed = () => process.env.ALLOW_DEGRADED_DB_MODE !== 'false';

const validateRuntimeEnvironment = () => {
  try {
    validateEnv();
    return true;
  } catch (error) {
    console.warn(`[ENV WARNING] ${error.message}`);
    console.warn('[ENV WARNING] Fix the missing values in .env, then restart the backend');
    return false;
  }
};

const startServer = async () => {
  if (!validateRuntimeEnvironment()) {
    process.exitCode = 1;
    return null;
  }

  console.log(`\n${divider}`);
  console.log('  RindaSeat Backend Startup');
  console.log(divider);
  console.log(`[ENV] Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[ENV] App: ${process.env.APP_NAME || 'RindaSeat'} v${process.env.APP_VERSION || '1.0.0'}`);
  console.log(`[DB] Host: ${getDatabaseHost()}`);

  initializeFirebase();

  const postgresHealth = await checkPostgresHealth();

  if (!postgresHealth.ok && !degradedModeAllowed()) {
    console.error('[SERVER] PostgreSQL health check failed and degraded mode is disabled');
    console.error('[SERVER] Check your DATABASE_URL and ensure PostgreSQL service is running');
    console.log(`${divider}\n`);
    process.exitCode = 1;
    return null;
  }

  if (!postgresHealth.ok) {
    console.warn('[SERVER] Starting in degraded DB mode');
    console.warn('[SERVER] Database operations may be limited. Fix the database connection.');
  }

  try {
    const server = http.createServer(app);
    const io = initializeSocket(server);

    console.log('[SOCKET] Socket.IO initialized');

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[SERVER] Port ${PORT} is already in use`);
        console.error('[SERVER] Stop the other process or set a different PORT in .env');
        return;
      }

      console.error(`[SERVER] Runtime server error: ${error.message}`);
    });

    server.listen(PORT, () => {
      const address = server.address();
      const runningPort = address && address.port ? address.port : PORT;
      console.log(`[SERVER] Running on port ${runningPort}`);
      console.log(`${divider}\n`);
    });

    return {
      server,
      io,
      postgresHealth
    };
  } catch (error) {
    console.error(`[SERVER] Failed to start RindaSeat backend: ${error.message}`);
    console.log(`${divider}\n`);
    process.exitCode = 1;
    return null;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer
};
