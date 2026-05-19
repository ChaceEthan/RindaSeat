// @ts-nocheck
const fs = require('fs');
const path = require('path');

const LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG'
};

const getCurrentLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
  return LEVELS[envLevel] !== undefined ? LEVELS[envLevel] : LEVELS.INFO;
};

const shouldLog = (level) => level <= getCurrentLogLevel();

const formatTimestamp = () => new Date().toISOString();

const colorizeOutput = (level, message) => {
  const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m', // Yellow
    INFO: '\x1b[36m', // Cyan
    DEBUG: '\x1b[35m' // Magenta
  };

  const reset = '\x1b[0m';

  if (process.env.NODE_ENV === 'development') {
    return `${colors[level] || ''}[${level}]${reset} ${message}`;
  }

  return `[${level}] ${message}`;
};

const writeToFile = (level, message, meta = {}) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    const logsDir = path.join(__dirname, '../../logs');

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    const filename = path.join(logsDir, `${date}.log`);

    const logEntry = JSON.stringify({
      timestamp: formatTimestamp(),
      level: LEVEL_NAMES[LEVELS[level.toUpperCase()]] || level.toUpperCase(),
      message,
      meta,
      pid: process.pid
    });

    fs.appendFileSync(filename, `${logEntry}\n`, { encoding: 'utf8' });
  } catch (error) {
    // Fail silently to avoid infinite loops
    console.error('Failed to write to log file:', error.message);
  }
};

const write = (level, message, meta = {}) => {
  const levelKey = level.toUpperCase();
  const levelValue = LEVELS[levelKey];

  if (!shouldLog(levelValue)) {
    return;
  }

  const timestamp = formatTimestamp();
  const output = `${timestamp} ${colorizeOutput(levelKey, message)}`;

  if (levelValue === LEVELS.ERROR) {
    console.error(output);
  } else if (levelValue === LEVELS.WARN) {
    console.warn(output);
  } else {
    console.log(output);
  }

  // Write to file in production
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
    writeToFile(level, message, meta);
  }
};

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
  debug: (message, meta) => write('debug', message, meta),
  log: (message, meta) => write('info', message, meta)
};

