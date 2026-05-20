// @ts-nocheck
const ENV_GROUPS = {
  DB: {
    required: ['DATABASE_URL'],
    optional: []
  },
  JWT: {
    required: ['JWT_SECRET'],
    optional: ['JWT_EXPIRES_IN']
  },
  MoMo: {
    required: [],
    optional: [
      'MTN_MOMO_API_USER',
      'MTN_MOMO_API_KEY',
      'MTN_MOMO_API_SECRET',
      'MTN_MOMO_SUBSCRIPTION_KEY',
      'MTN_MOMO_BASE_URL',
      'MTN_MOMO_TARGET_ENV'
    ]
  },
  Stripe: {
    required: [],
    optional: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
  },
  Firebase: {
    required: [],
    optional: [
      'FCM_SERVER_KEY',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ]
  },
  Email: {
    required: [],
    optional: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM']
  },
  SMS: {
    required: [],
    optional: ['SMS_API_KEY', 'SMS_SENDER_ID', 'SMS_API_URL']
  },
  Logging: {
    required: [],
    optional: ['LOG_LEVEL', 'ENABLE_REQUEST_LOGGING']
  },
  General: {
    required: [],
    optional: [
      'PORT',
      'NODE_ENV',
      'APP_NAME',
      'APP_VERSION',
      'CLIENT_URL',
      'MOBILE_APP_NAME',
      'BCRYPT_SALT_ROUNDS',
      'SOCKET_CORS_ORIGIN',
      'ENABLE_SOCKET_LOGS',
      'QR_CODE_EXPIRATION_MINUTES',
      'SEAT_LOCK_TIMEOUT_MINUTES',
      'MAX_BOOKINGS_PER_USER',
      'DEFAULT_CURRENCY',
      'AIRTEL_CLIENT_ID',
      'AIRTEL_CLIENT_SECRET',
      'AIRTEL_BASE_URL',
      'GOOGLE_MAPS_API_KEY',
      'MAX_FILE_UPLOAD_SIZE',
      'RATE_LIMIT_WINDOW_MS',
      'RATE_LIMIT_MAX_REQUESTS',
      'DEFAULT_ADMIN_EMAIL',
      'DEFAULT_ADMIN_PASSWORD',
      'ENABLE_GPS_TRACKING',
      'ENABLE_ADS',
      'ENABLE_SWAGGER',
      'EDB_REPO_TOKEN'
    ]
  }
};

const REQUIRED_ENV_KEYS = Object.values(ENV_GROUPS).flatMap(({ required }) => required);
const OPTIONAL_ENV_KEYS = Object.values(ENV_GROUPS).flatMap(({ optional }) => optional);
const isProductionRuntime = () => process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

const getDefaultEnvValues = () => (
  isProductionRuntime()
    ? {}
    : { PORT: '5000' }
);

const PLACEHOLDER_PATTERNS = [
  /^YOUR_/i,
  /_HERE$/i,
  /^REPLACE/i,
  /^CHANGE_ME$/i,
  /^TODO$/i
];

const normalizeValue = (value) => String(value || '').trim().replace(/^['"]|['"]$/g, '');

const isLocalDatabaseUrl = (databaseUrl) => {
  try {
    const parsedUrl = new URL(databaseUrl);
    return ['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname);
  } catch (error) {
    return false;
  }
};

const isMissing = (key) => {
  const value = normalizeValue(process.env[key]);

  if (!value) {
    return true;
  }

  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
};

const getMissingByGroup = (keysByGroup) => (
  Object.entries(keysByGroup).reduce((missingByGroup, [group, keys]) => {
    const missing = keys.filter(isMissing);

    if (missing.length > 0) {
      missingByGroup[group] = missing;
    }

    return missingByGroup;
  }, {})
);

const formatGroupedMissing = (missingByGroup) => (
  Object.entries(missingByGroup)
    .map(([group, keys]) => `[${group}] ${keys.join(', ')}`)
    .join('; ')
);

const validateEnv = (logger = console) => {
  Object.entries(getDefaultEnvValues()).forEach(([key, value]) => {
    if (isMissing(key)) {
      process.env[key] = value;

      if (logger && typeof logger.warn === 'function') {
        logger.warn(`[ENV] ${key} missing. Defaulting to ${value}.`);
      }
    }
  });

  const requiredByGroup = Object.fromEntries(
    Object.entries(ENV_GROUPS).map(([group, config]) => [group, config.required])
  );
  const optionalByGroup = Object.fromEntries(
    Object.entries(ENV_GROUPS).map(([group, config]) => [group, config.optional])
  );

  const missingRequiredByGroup = getMissingByGroup(requiredByGroup);
  const missingOptionalByGroup = getMissingByGroup(optionalByGroup);
  const missingRequired = Object.values(missingRequiredByGroup).flat();
  const missingOptional = Object.values(missingOptionalByGroup).flat();

  if (isProductionRuntime() && isMissing('PORT')) {
    throw new Error('PORT is required in production. Render provides this automatically at runtime.');
  }

  if (isProductionRuntime() && !isMissing('DATABASE_URL') && isLocalDatabaseUrl(process.env.DATABASE_URL)) {
    throw new Error('DATABASE_URL must not point to localhost in production. Use the Render PostgreSQL connection string.');
  }

  if (missingRequired.length > 0) {
    if (missingRequired.includes('DATABASE_URL')) {
      throw new Error('DATABASE_URL is required. Add DATABASE_URL to backend/.env before starting the server.');
    }

    throw new Error(
      `Missing critical environment configuration: ${formatGroupedMissing(missingRequiredByGroup)}`
    );
  }

  if (missingOptional.length > 0 && logger && typeof logger.warn === 'function') {
    logger.warn(
      `Optional environment configuration missing or still using placeholders: ${formatGroupedMissing(missingOptionalByGroup)}. Backend startup will continue, but those integrations must be configured before production use.`
    );
  }

  return {
    required: REQUIRED_ENV_KEYS,
    optional: OPTIONAL_ENV_KEYS,
    missingRequired,
    missingOptional,
    missingRequiredByGroup,
    missingOptionalByGroup
  };
};

module.exports = {
  ENV_GROUPS,
  REQUIRED_ENV_KEYS,
  OPTIONAL_ENV_KEYS,
  getDefaultEnvValues,
  validateEnv
};
