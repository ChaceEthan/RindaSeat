require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { Pool } = require('pg');

const DEFAULT_DATABASE = 'rindaseat';
const MAINTENANCE_DATABASES = ['postgres', 'template1'];
const isProductionRuntime = () => process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

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

const getDatabaseUrlForName = (databaseUrl, databaseName) => {
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
  return isProductionRuntime() && !localHosts.includes(databaseUrl.hostname);
};

const getSslConfig = (databaseUrl) => {
  if (!shouldUseSsl(databaseUrl)) {
    return false;
  }

  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true' ? true : false
  };
};

const createPool = (connectionString, databaseUrl) => new Pool({
  connectionString,
  ssl: getSslConfig(databaseUrl),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000
});

const quoteIdentifier = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

const formatError = (error) => {
  const parts = [];

  if (error.code) {
    parts.push(error.code);
  }

  if (error.address || error.port) {
    parts.push(`${error.address || 'unknown-host'}:${error.port || 'unknown-port'}`);
  }

  if (error.message) {
    parts.push(error.message);
  }

  return parts.length > 0 ? parts.join(' - ') : 'Unknown error';
};

const detectPostgresCli = () => {
  if (isProductionRuntime()) {
    return;
  }

  const commonWindowsPaths = [
    'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe'
  ];
  const installedPath = commonWindowsPaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (installedPath) {
    console.log(`[POSTGRES] psql path detected: ${installedPath}`);
    return;
  }

  const pathCheck = spawnSync('psql', ['--version'], {
    stdio: 'ignore',
    shell: false
  });

  if (!pathCheck.error && pathCheck.status === 0) {
    console.log('[POSTGRES] psql path detected: PATH');
    return;
  }

  console.warn('[POSTGRES] psql path detected: not found');
  console.warn('[FIX] Add to PATH: C:\\Program Files\\PostgreSQL\\16\\bin');
  console.warn('[DB INFO] PostgreSQL CLI not found. Use db:setup instead.');
};

const resolveSqlPath = (fileName) => {
  const candidates = [
    path.join(__dirname, '..', 'database', fileName),
    path.join(__dirname, '../../database', fileName)
  ];
  const resolvedPath = candidates.find((candidatePath) => fs.existsSync(candidatePath));

  if (!resolvedPath) {
    throw new Error(`Could not find ${fileName}. Checked: ${candidates.join(', ')}`);
  }

  return resolvedPath;
};

const runSqlFile = async (pool, label, filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8').trim();

  if (!sql) {
    console.warn(`[DB WARNING] ${label} file is empty: ${filePath}`);
    return;
  }

  console.log(`[DB] Running ${label}...`);
  await pool.query(sql);
};

const createDatabaseIfMissing = async (databaseUrl, targetDatabase) => {
  console.log('[DB] Creating database if not exists...');

  let lastError;

  for (const maintenanceDatabase of MAINTENANCE_DATABASES) {
    const maintenanceConnectionString = getDatabaseUrlForName(databaseUrl, maintenanceDatabase);
    const maintenancePool = createPool(maintenanceConnectionString, databaseUrl);

    try {
      const existingDatabase = await maintenancePool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [targetDatabase]
      );

      if (existingDatabase.rowCount === 0) {
        await maintenancePool.query(`CREATE DATABASE ${quoteIdentifier(targetDatabase)}`);
        console.log(`[DB] Created database ${targetDatabase}`);
      } else {
        console.log(`[DB] Database ${targetDatabase} already exists`);
      }

      await maintenancePool.end();
      return;
    } catch (error) {
      lastError = error;
      await maintenancePool.end().catch(() => {});
    }
  }

  throw lastError;
};

const setupDatabase = async () => {
  detectPostgresCli();

  const databaseUrl = parseDatabaseUrl();
  const targetDatabase = getTargetDatabase(databaseUrl);
  const schemaPath = resolveSqlPath('schema.sql');
  const seedPath = resolveSqlPath('seed.sql');

  try {
    await createDatabaseIfMissing(databaseUrl, targetDatabase);

    const targetPool = createPool(getDatabaseUrlForName(databaseUrl, targetDatabase), databaseUrl);

    try {
      await runSqlFile(targetPool, 'schema', schemaPath);
      await runSqlFile(targetPool, 'seed', seedPath);
      console.log('[DB] Setup complete');
    } finally {
      await targetPool.end();
    }
  } catch (error) {
    console.error(`[DB ERROR] Setup failed -> ${formatError(error)}`);
    console.error('[DB INFO] PostgreSQL CLI not found. Use db:setup instead.');
    console.error('[DB INFO] If PostgreSQL is not installed, install it and ensure the service is running.');
    console.error('[DB INFO] Manual fallback: "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe" -U postgres');
    process.exitCode = 1;
  }
};

setupDatabase();
