// @ts-nocheck
const { runMigrations } = require('./migrations');

let bootstrapPromise = null;
let lastStartedAt = 0;
let status = {
  state: 'idle',
  result: null,
  error: null,
  checkedAt: null
};

const RETRY_AFTER_MS = 30000;

const quietLogger = {
  log: () => {},
  warn: (message) => console.warn(message),
  error: (message) => console.error(message)
};

const startDatabaseBootstrap = ({ logger = console, force = false } = {}) => {
  const now = Date.now();
  const canRetry = status.state === 'failed' && now - lastStartedAt > RETRY_AFTER_MS;

  if (!force && bootstrapPromise && !canRetry) {
    return bootstrapPromise;
  }

  lastStartedAt = now;
  status = {
    state: 'running',
    result: null,
    error: null,
    checkedAt: new Date().toISOString()
  };

  bootstrapPromise = runMigrations({ logger })
    .then((result) => {
      status = {
        state: result.success ? 'ready' : 'failed',
        result,
        error: result.success ? null : result.error || result.message,
        checkedAt: new Date().toISOString()
      };

      return result;
    })
    .catch((error) => {
      status = {
        state: 'failed',
        result: null,
        error: error.message,
        checkedAt: new Date().toISOString()
      };

      return {
        success: false,
        error: error.message,
        message: 'Database bootstrap failed'
      };
    });

  return bootstrapPromise;
};

const waitForDatabaseBootstrap = async ({
  timeoutMs = Number(process.env.DB_BOOTSTRAP_WAIT_MS) || 15000,
  logger = quietLogger
} = {}) => {
  const bootstrap = startDatabaseBootstrap({ logger });
  let timeoutId;

  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({
        success: false,
        timedOut: true,
        error: 'Database bootstrap timed out',
        message: 'Database bootstrap is still running'
      });
    }, timeoutMs);
  });

  const result = await Promise.race([bootstrap, timeout]);
  clearTimeout(timeoutId);
  return result;
};

const getDatabaseBootstrapStatus = () => ({
  ...status,
  result: status.result ? { ...status.result } : null
});

module.exports = {
  getDatabaseBootstrapStatus,
  startDatabaseBootstrap,
  waitForDatabaseBootstrap
};
