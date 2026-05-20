// @ts-nocheck
require('dotenv').config();

const { pool, formatDatabaseError } = require('../config/db');

const REQUIRED_TABLES = [
  'users',
  'companies',
  'stations',
  'buses',
  'routes',
  'trips',
  'bookings',
  'payments'
];

const isProductionRuntime = () => process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

const createTableStatus = (existingTables = []) => (
  REQUIRED_TABLES.reduce((status, tableName) => {
    status[tableName] = existingTables.includes(tableName);
    return status;
  }, {})
);

let databaseStatus = {
  connected: false,
  database: null,
  host: null,
  tables: createTableStatus(),
  missingTables: REQUIRED_TABLES,
  checkedAt: null,
  error: null
};

const getDatabaseHost = () => {
  if (!process.env.DATABASE_URL) {
    return 'not configured';
  }

  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    return parsedUrl.port ? `${parsedUrl.hostname}:${parsedUrl.port}` : parsedUrl.hostname;
  } catch (error) {
    return 'invalid DATABASE_URL';
  }
};

const verifyTables = async (client) => {
  const result = await client.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [REQUIRED_TABLES]
  );
  const existingTables = result.rows.map((row) => row.table_name);
  const missingTables = REQUIRED_TABLES.filter((tableName) => !existingTables.includes(tableName));

  return {
    existingTables,
    missingTables,
    tables: createTableStatus(existingTables)
  };
};

const updateDatabaseStatus = (nextStatus) => {
  databaseStatus = {
    ...databaseStatus,
    ...nextStatus,
    checkedAt: new Date().toISOString()
  };

  return databaseStatus;
};

const getDatabaseStatus = () => ({
  ...databaseStatus,
  tables: { ...databaseStatus.tables },
  missingTables: [...databaseStatus.missingTables]
});

const checkDatabase = async ({ logger = console, silent = false } = {}) => {
  const host = getDatabaseHost();
  let client;

  try {
    if (!silent) {
      logger.log('[DB] Connecting to PostgreSQL...');
    }

    client = await pool.connect();

    const databaseResult = await client.query('SELECT current_database() AS database');
    const database = databaseResult.rows[0].database;
    const { existingTables, missingTables, tables } = await verifyTables(client);

    updateDatabaseStatus({
      connected: true,
      database,
      host,
      tables,
      missingTables,
      error: null
    });

    if (!silent) {
      const databaseLabel = isProductionRuntime()
        ? `production database (${database})`
        : database;

      logger.log(`[DB] Connected successfully to ${databaseLabel}`);
      logger.log('[DB] Pool ready');

      if (missingTables.length > 0) {
        logger.warn(`[DB] Missing tables: ${missingTables.join(', ')}`);
      } else {
        logger.log(`[DB] Required tables verified: ${existingTables.join(', ')}`);
      }
    }

    return getDatabaseStatus();
  } catch (error) {
    const message = formatDatabaseError(error);

    updateDatabaseStatus({
      connected: false,
      database: null,
      host,
      tables: createTableStatus(),
      missingTables: REQUIRED_TABLES,
      error: message
    });

    if (!silent) {
      logger.error(`[DB ERROR] connection failed -> ${message}`);
    }

    return getDatabaseStatus();
  } finally {
    if (client) {
      client.release();
    }
  }
};

if (require.main === module) {
  checkDatabase()
    .then(async (status) => {
      await pool.end();
      process.exit(status.connected ? 0 : 1);
    })
    .catch(async (error) => {
      console.error(`[DB] Database verification failed: ${formatDatabaseError(error)}`);
      await pool.end();
      process.exit(1);
    });
}

module.exports = {
  REQUIRED_TABLES,
  checkDatabase,
  formatDatabaseError,
  getDatabaseHost,
  getDatabaseStatus
};
