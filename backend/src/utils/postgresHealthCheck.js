// @ts-nocheck
require('dotenv').config();

const { checkDatabase, getDatabaseStatus, REQUIRED_TABLES } = require('./checkDatabase');
const { connectDatabaseWithRetry } = require('../config/db');

const getConfiguredDatabaseName = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    return decodeURIComponent(databaseUrl.pathname.replace(/^\//, '')) || null;
  } catch (error) {
    return null;
  }
};

const checkPostgresHealth = async ({ logger = console } = {}) => {
  const databaseName = getConfiguredDatabaseName();

  if (!process.env.DATABASE_URL) {
    logger.warn('[DB] DATABASE_URL is not configured. PostgreSQL health is degraded.');
    const status = getDatabaseStatus();

    return {
      ok: false,
      degraded: true,
      database: {
        exists: false,
        reachable: false,
        name: databaseName,
        status
      },
      tables: status.tables,
      error: 'DATABASE_URL is not configured'
    };
  }

  const connection = await connectDatabaseWithRetry({
    logger,
    retries: Number(process.env.DB_HEALTH_RETRIES) || 2,
    delayMs: Number(process.env.DB_HEALTH_RETRY_DELAY_MS) || 1000
  });

  if (!connection.connected) {
    const status = getDatabaseStatus();

    return {
      ok: false,
      degraded: true,
      database: {
        exists: null,
        reachable: false,
        name: databaseName,
        status
      },
      tables: status.tables,
      error: connection.error
    };
  }

  const status = await checkDatabase({ logger, silent: true });
  const tablesOk = REQUIRED_TABLES.every((tableName) => status.tables[tableName]);
  const ok = status.connected && tablesOk;

  if (tablesOk) {
    logger.log(`[DB] Required tables verified: ${REQUIRED_TABLES.join(', ')}`);
  } else {
    logger.warn(`[DB] Missing tables: ${status.missingTables.join(', ')}`);
  }

  return {
    ok,
    degraded: !ok,
    database: {
      exists: null,
      reachable: status.connected,
      name: status.database || databaseName,
      status
    },
    tables: status.tables,
    error: status.error
  };
};

if (require.main === module) {
  checkPostgresHealth()
    .then((health) => {
      if (health.ok) {
        console.log('[POSTGRES] Health check passed');
      } else {
        console.warn('[POSTGRES] Health check completed in degraded mode');
      }

      process.exitCode = health.ok ? 0 : 1;
    })
    .catch((error) => {
      console.error(`[POSTGRES] Health check failed: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = {
  checkPostgresHealth
};
