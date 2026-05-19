// @ts-nocheck
/**
 * Production Health Check System
 * Monitors server, database, and integrations
 */

const { getDatabaseStatus } = require('./checkDatabase');
const { isFirebaseConfigured } = require('../config/firebase');

const startTime = Date.now();

const getUptimeString = () => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

const checkPaymentIntegrations = () => {
  const hasValue = (val) => Boolean(val && String(val).trim());
  const isProductionKey = (key) => {
    if (!key) return false;
    const str = String(key);
    return !str.match(/^test/i) && !str.match(/^sk_test/);
  };

  return {
    momo: {
      configured: hasValue(process.env.MTN_MOMO_API_KEY) && hasValue(process.env.MTN_MOMO_SUBSCRIPTION_KEY),
      production: hasValue(process.env.MTN_MOMO_TARGET_ENV) && process.env.MTN_MOMO_TARGET_ENV === 'production',
      environment: process.env.MTN_MOMO_TARGET_ENV || 'not-configured'
    },
    stripe: {
      configured: hasValue(process.env.STRIPE_SECRET_KEY),
      production: isProductionKey(process.env.STRIPE_SECRET_KEY),
      webhook: hasValue(process.env.STRIPE_WEBHOOK_SECRET)
    },
    airtel: {
      configured: hasValue(process.env.AIRTEL_CLIENT_ID) && hasValue(process.env.AIRTEL_CLIENT_SECRET),
      production: true
    }
  };
};

const checkNotificationIntegrations = () => ({
  firebase: {
    configured: isFirebaseConfigured(),
    messaging: hasValue(process.env.FIREBASE_PROJECT_ID)
  },
  email: {
    configured: Boolean(
      process.env.SMTP_HOST
      && process.env.SMTP_USER
      && process.env.SMTP_PASS
      && process.env.EMAIL_FROM
    ),
    provider: process.env.SMTP_HOST || 'not-configured'
  },
  sms: {
    configured: Boolean(
      process.env.SMS_API_KEY
      && process.env.SMS_SENDER_ID
      && process.env.SMS_API_URL
    ),
    provider: process.env.SMS_API_URL || 'not-configured'
  }
});

const hasValue = (val) => Boolean(val && String(val).trim());

const checkSecurityConfiguration = () => ({
  jwtConfigured: hasValue(process.env.JWT_SECRET),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  corsEnabled: true,
  helmetEnabled: true,
  rateLimitingEnabled: true
});

const generateHealthReport = () => {
  const dbStatus = getDatabaseStatus();
  const payments = checkPaymentIntegrations();
  const notifications = checkNotificationIntegrations();
  const security = checkSecurityConfiguration();

  const integrationsConfigured = Object.values(payments).filter(
    (p) => p.configured
  ).length + Object.values(notifications).filter((n) => n.configured).length;

  return {
    timestamp: new Date().toISOString(),
    server: {
      status: 'running',
      uptime: getUptimeString(),
      environment: process.env.NODE_ENV || 'development',
      port: Number(process.env.PORT) || 5000
    },
    database: {
      status: dbStatus.connected ? 'connected' : 'disconnected',
      host: dbStatus.host,
      name: dbStatus.database,
      tables: dbStatus.tables,
      missingTables: dbStatus.missingTables
    },
    integrations: {
      payment: payments,
      notification: notifications,
      configured: integrationsConfigured,
      total: Object.keys(payments).length + Object.keys(notifications).length
    },
    security: security,
    health: {
      overall: dbStatus.connected ? 'healthy' : 'degraded',
      canAcceptBookings: dbStatus.connected && Object.keys(dbStatus.tables).every((t) => dbStatus.tables[t])
    }
  };
};

module.exports = {
  generateHealthReport,
  getUptimeString,
  checkPaymentIntegrations,
  checkNotificationIntegrations,
  checkSecurityConfiguration
};
