// @ts-nocheck
require('dotenv').config();

const { Pool } = require('pg');

const DEFAULT_RETRY_ATTEMPTS = 5;
const DEFAULT_RETRY_DELAY_MS = 2000;

const isProductionRuntime = () => process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

const parseDatabaseUrl = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    return new URL(process.env.DATABASE_URL);
  } catch (error) {
    return null;
  }
};

const shouldUseSsl = () => {
  if (process.env.DATABASE_SSL === 'true') {
    return true;
  }

  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }

  const parsedUrl = parseDatabaseUrl();
  const hostname = parsedUrl ? parsedUrl.hostname : '';
  const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(hostname);

  return isProductionRuntime() && !isLocalDatabase;
};

const getSslConfig = () => {
  if (!shouldUseSsl()) {
    return false;
  }

  // Managed PostgreSQL providers commonly require SSL while local development usually does not.
  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true' ? true : false
  };
};

const createUnavailablePool = () => {
  const error = new Error('DATABASE_URL is required before PostgreSQL connections can be opened');
  const fail = async () => {
    throw error;
  };

  return {
    connect: fail,
    query: fail,
    end: async () => {},
    on: () => {}
  };
};

const formatDatabaseError = (error) => {
  if (!error) {
    return 'Unknown PostgreSQL error';
  }

  const details = [];

  if (error.code) {
    details.push(error.code);
  }

  if (error.address || error.port) {
    details.push(`${error.address || 'unknown-host'}:${error.port || 'unknown-port'}`);
  }

  if (error.message) {
    details.push(error.message);
  }

  if (Array.isArray(error.errors)) {
    error.errors.forEach((innerError) => {
      const innerDetails = [innerError.code, innerError.address, innerError.port]
        .filter(Boolean)
        .join(' ');

      if (innerDetails) {
        details.push(innerDetails);
      }
    });
  }

  return details.length > 0 ? details.join(' - ') : error.name || 'Unknown PostgreSQL error';
};

const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: getSslConfig(),
    max: Number(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000
  })
  : createUnavailablePool();

pool.on('error', (error) => {
  console.error(`[DB ERROR] pool error -> ${formatDatabaseError(error)}`);
});

const query = (text, params) => pool.query(text, params);

const wait = (milliseconds) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

const connectDatabase = async ({ logger = console } = {}) => {
  let client;

  try {
    logger.log('[DB] Connecting to PostgreSQL...');
    client = await pool.connect();

    const result = await client.query('SELECT current_database() AS database');
    const database = result.rows[0] ? result.rows[0].database : 'unknown';

    const databaseLabel = isProductionRuntime()
      ? `production database (${database})`
      : database;

    logger.log(`[DB] Connected successfully to ${databaseLabel}`);
    logger.log('[DB] Pool ready');

    return {
      connected: true,
      database
    };
  } catch (error) {
    const formattedError = formatDatabaseError(error);
    logger.error(`[DB] Connection failed -> ${formattedError}`);

    if (process.env.NODE_ENV === 'development') {
      logger.error('[DB] Connection failed. Check PostgreSQL service and database existence.');
      logger.error('[DB] Ensure DATABASE_URL in .env is correct and PostgreSQL is running.');
    }

    return {
      connected: false,
      error: formattedError
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};

const connectDatabaseWithRetry = async ({
  logger = console,
  retries = DEFAULT_RETRY_ATTEMPTS,
  delayMs = DEFAULT_RETRY_DELAY_MS
} = {}) => {
  let lastResult = {
    connected: false,
    error: 'Connection was not attempted'
  };

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    lastResult = await connectDatabase({ logger });

    if (lastResult.connected) {
      return lastResult;
    }

    if (attempt < retries) {
      logger.warn(`[DB] Retry ${attempt + 1}/${retries} in ${delayMs / 1000}s`);
      await wait(delayMs);
    }
  }

  logger.error('[DB] Connection failed. Check PostgreSQL service and database existence.');
  return lastResult;
};

module.exports = {
  pool,
  query,
  connectDatabase,
  connectDatabaseWithRetry,
  formatDatabaseError
};
