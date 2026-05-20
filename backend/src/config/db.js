// @ts-nocheck
require('dotenv').config();

const { Pool } = require('pg');

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1500;

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

const createUnavailablePool = () => {
  const fail = async () => {
    throw new Error('DATABASE_URL is not configured; PostgreSQL is unavailable');
  };

  return {
    connect: fail,
    query: fail,
    end: async () => {},
    on: () => {}
  };
};

const shouldUseSsl = () => {
  if (process.env.DB_SSL === 'false') {
    return false;
  }

  if (process.env.DB_SSL === 'true') {
    return true;
  }

  return process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);
};

const createPool = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB WARNING] DATABASE_URL is not configured. Server will start with database routes degraded.');
    return createUnavailablePool();
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: shouldUseSsl() ? { rejectUnauthorized: false } : false,
    max: Number(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000
  });
};

const pool = createPool();

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

    logger.log(`[DB] Connected successfully to ${database}`);
    logger.log('[DB] Pool ready');

    return {
      connected: true,
      database
    };
  } catch (error) {
    const formattedError = formatDatabaseError(error);
    logger.error(`[DB] Connection failed -> ${formattedError}`);

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

  logger.warn('[DB] PostgreSQL is unavailable. Server remains online and will retry on later requests.');
  return lastResult;
};

module.exports = {
  pool,
  query,
  connectDatabase,
  connectDatabaseWithRetry,
  formatDatabaseError
};
