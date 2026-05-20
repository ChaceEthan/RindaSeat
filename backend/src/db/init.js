// @ts-nocheck
const { runMigrations } = require('../utils/migrations');

const initDB = async () => {
  const result = await runMigrations();

  if (!result.success) {
    throw new Error(result.error || result.message || 'Database bootstrap failed');
  }

  return result;
};

module.exports = {
  initDB
};
