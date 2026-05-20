// @ts-nocheck
require('dotenv').config();

const { getDatabaseStatus, REQUIRED_TABLES } = require('./checkDatabase');
const { connectDatabaseWithRetry, pool, formatDatabaseError } = require('../config/db');

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

const createTableStatus = (existingTables = []) => (
  REQUIRED_TABLES.reduce((status, tableName) => {
    status[tableName] = existingTables.includes(tableName);
    return status;
  }, {})
);

const getPublicTableStatus = async () => {
  let client;

  try {
    client = await pool.connect();

    const databaseResult = await client.query('SELECT current_database() AS database');
    const tableResult = await client.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_type = 'BASE TABLE'
         AND table_name = ANY($1::text[])`,
      [REQUIRED_TABLES]
    );

    const existingTables = tableResult.rows.map((row) => row.table_name);
    const missingTables = REQUIRED_TABLES.filter((tableName) => !existingTables.includes(tableName));

    return {
      connected: true,
      database: databaseResult.rows[0]?.database || null,
      existingTables,
      missingTables,
      tables: createTableStatus(existingTables),
      error: null
    };
  } catch (error) {
    return {
      connected: false,
      database: null,
      existingTables: [],
      missingTables: REQUIRED_TABLES,
      tables: createTableStatus(),
      error: formatDatabaseError(error)
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};

const checkPostgresHealth = async ({ logger = console } = {}) => {
  const databaseName = getConfiguredDatabaseName();

  if (!process.env.DATABASE_URL) {
    logger.warn('[DB] DATABASE_URL is not configured. PostgreSQL health is degraded.');
    const status = getDatabaseStatus();

    return {
      ok: false,
      healthy: false,
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
      healthy: false,
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

  const status = await getPublicTableStatus();
  const tablesOk = REQUIRED_TABLES.every((tableName) => status.tables[tableName]);
  const ok = status.connected && tablesOk;

  if (tablesOk) {
    logger.log(`[DB] Required tables verified: ${REQUIRED_TABLES.join(', ')}`);
  } else {
    logger.warn(`[DB] Missing tables: ${status.missingTables.join(', ')}`);
  }

  return {
    ok,
    healthy: ok,
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
  checkPostgresHealth,
  getPublicTableStatus
};
