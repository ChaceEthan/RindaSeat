require('dotenv').config();

const { pool, formatDatabaseError } = require('../src/config/db');
const { runMigrations } = require('../src/utils/migrations');

const setupDatabase = async () => {
  try {
    const migration = await runMigrations({ seed: process.env.SKIP_DB_SEED !== 'true' });

    if (!migration.success) {
      throw new Error(migration.error || migration.message);
    }

    console.log('[DB] Setup complete');
  } catch (error) {
    console.error(`[DB ERROR] Setup failed -> ${formatDatabaseError(error)}`);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
};

setupDatabase();
