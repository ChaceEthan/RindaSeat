// @ts-nocheck
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { Pool } = require('pg');

const { checkDatabase, getDatabaseStatus, REQUIRED_TABLES } = require('./checkDatabase');
const { connectDatabaseWithRetry, formatDatabaseError } = require('../config/db');

const COMMON_POSTGRES_BIN_PATHS = [
  'C:\\Program Files\\PostgreSQL\\16\\bin',
  'C:\\Program Files\\PostgreSQL\\15\\bin',
  'C:\\Program Files\\PostgreSQL\\14\\bin'
];
const DEFAULT_DATABASE = 'rindaseat';

const getPsqlExecutable = (binPath) => path.join(binPath, 'psql.exe');

const detectPsqlPath = ({ logger = console } = {}) => {
  const detectedBinPath = COMMON_POSTGRES_BIN_PATHS.find((binPath) => (
    fs.existsSync(getPsqlExecutable(binPath))
  ));

  if (detectedBinPath) {
    const psqlPath = getPsqlExecutable(detectedBinPath);
    logger.log(`[POSTGRES] psql path detected: ${psqlPath}`);

    return {
      available: true,
      source: 'windows-install-path',
      binPath: detectedBinPath,
      psqlPath
    };
  }

  const pathCheck = spawnSync('psql', ['--version'], {
    encoding: 'utf8',
    shell: false
  });

  if (!pathCheck.error && pathCheck.status === 0) {
    logger.log('[POSTGRES] psql path detected: PATH');

    return {
      available: true,
      source: 'PATH',
      binPath: null,
      psqlPath: 'psql'
    };
  }

  logger.warn('[POSTGRES] psql path detected: not found');
  logger.warn('[FIX] Add to PATH: C:\\Program Files\\PostgreSQL\\16\\bin');

  return {
    available: false,
    source: 'not-found',
    binPath: null,
    psqlPath: null
  };
};

const parseDatabaseUrl = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from .env');
  }

  try {
    return new URL(process.env.DATABASE_URL);
  } catch (error) {
    throw new Error(`DATABASE_URL is invalid: ${error.message}`);
  }
};

const getTargetDatabase = (databaseUrl) => {
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
  return databaseName || DEFAULT_DATABASE;
};

const getConnectionStringForDatabase = (databaseUrl, databaseName) => {
  const nextUrl = new URL(databaseUrl.toString());
  nextUrl.pathname = `/${encodeURIComponent(databaseName)}`;
  return nextUrl.toString();
};

const shouldUseSsl = (databaseUrl) => {
  if (process.env.DATABASE_SSL === 'true') {
    return true;
  }

  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }

  const localHosts = ['localhost', '127.0.0.1', '::1'];
  return process.env.NODE_ENV === 'production' && !localHosts.includes(databaseUrl.hostname);
};

const getSslConfig = (databaseUrl) => {
  if (!shouldUseSsl(databaseUrl)) {
    return false;
  }

  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
  };
};

const createPool = (connectionString, databaseUrl) => new Pool({
  connectionString,
  ssl: getSslConfig(databaseUrl),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000
});

const checkDatabaseExists = async ({ databaseUrl, databaseName, logger = console }) => {
  const maintenanceDatabases = ['postgres', 'template1'];
  let lastError;

  for (const maintenanceDatabase of maintenanceDatabases) {
    const pool = createPool(
      getConnectionStringForDatabase(databaseUrl, maintenanceDatabase),
      databaseUrl
    );

    try {
      const result = await pool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [databaseName]
      );
      await pool.end();

      if (result.rowCount === 0) {
        logger.warn(`[DB] Database missing. Run: CREATE DATABASE ${databaseName};`);
        return false;
      }

      return true;
    } catch (error) {
      lastError = error;
      await pool.end().catch(() => {});
    }
  }

  logger.error('[DB] Connection failed. Check PostgreSQL service and database existence.');
  logger.error(`[DB ERROR] ${formatDatabaseError(lastError)}`);
  return false;
};

const checkPostgresHealth = async ({ logger = console } = {}) => {
  const psql = detectPsqlPath({ logger });

  try {
    const databaseUrl = parseDatabaseUrl();
    const databaseName = getTargetDatabase(databaseUrl);
    const databaseExists = await checkDatabaseExists({ databaseUrl, databaseName, logger });

    if (!databaseExists) {
      const status = getDatabaseStatus();

      return {
        ok: false,
        degraded: true,
        psql,
        database: {
          exists: false,
          reachable: false,
          name: databaseName,
          status
        },
        tables: status.tables
      };
    }

    const connection = await connectDatabaseWithRetry({ logger });

    if (!connection.connected) {
      const status = getDatabaseStatus();

      return {
        ok: false,
        degraded: true,
        psql,
        database: {
          exists: true,
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
      psql,
      database: {
        exists: true,
        reachable: status.connected,
        name: status.database || databaseName,
        status
      },
      tables: status.tables
    };
  } catch (error) {
    logger.error(`[DB ERROR] ${error.message}`);

    return {
      ok: false,
      degraded: true,
      psql,
      database: {
        exists: false,
        reachable: false,
        name: DEFAULT_DATABASE,
        status: getDatabaseStatus()
      },
      tables: getDatabaseStatus().tables,
      error: error.message
    };
  }
};

if (require.main === module) {
  checkPostgresHealth()
    .then((health) => {
      if (health.ok) {
        console.log('[POSTGRES] Health check passed');
      } else {
        console.warn('[POSTGRES] Health check completed in degraded mode');
      }

      process.exit(health.ok ? 0 : 1);
    })
    .catch((error) => {
      console.error(`[POSTGRES] Health check failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  COMMON_POSTGRES_BIN_PATHS,
  checkPostgresHealth,
  detectPsqlPath
};
