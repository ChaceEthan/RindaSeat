// @ts-nocheck
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiLimiter = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
  BlockedPathMiddleware,
  SanitizeRequestMiddleware,
  SecurityHeadersMiddleware,
  SuspiciousRequestMiddleware
} = require('./middleware/securityMiddleware');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');
const companyRoutes = require('./routes/companyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const { generateHealthReport } = require('./utils/healthCheck');
const { isFirebaseConfigured } = require('./config/firebase');
const { getDatabaseBootstrapStatus, waitForDatabaseBootstrap } = require('./utils/databaseBootstrap');

const app = express();
const stripeWebhookPath = '/api/payments/webhooks/stripe';
const isProductionRuntime = () => process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);
const splitOrigins = (value = '') => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const configuredOrigins = [
  ...splitOrigins(process.env.CLIENT_URL),
  ...splitOrigins(process.env.CLIENT_ORIGIN),
  ...splitOrigins(process.env.FRONTEND_URL),
  ...splitOrigins(process.env.CORS_ORIGINS)
];
const allowedOrigins = [...new Set([
  ...configuredOrigins,
  ...(isProductionRuntime() ? ['https://rindaseat.vercel.app'] : [])
])];
const maxRequestBodySize = Number(process.env.MAX_FILE_UPLOAD_SIZE) || 1024 * 1024;
const enableRequestLogging = process.env.ENABLE_REQUEST_LOGGING !== 'false';
const isStripeWebhookRequest = (req) => req.originalUrl.split('?')[0] === stripeWebhookPath;
const allowVercelPreviewOrigins = process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === 'true';

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (!isProductionRuntime() && (allowedOrigins.includes('*') || configuredOrigins.length === 0)) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (allowVercelPreviewOrigins) {
    try {
      return new URL(origin).hostname.endsWith('.vercel.app');
    } catch (error) {
      return false;
    }
  }

  return false;
};

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(SecurityHeadersMiddleware);
app.use(BlockedPathMiddleware);
app.use((req, res, next) => {
  if (isStripeWebhookRequest(req)) {
    return next();
  }

  return express.json({ limit: maxRequestBodySize })(req, res, next);
});
app.use((req, res, next) => {
  if (isStripeWebhookRequest(req)) {
    return next();
  }

  return express.urlencoded({ extended: true, limit: maxRequestBodySize })(req, res, next);
});
app.use((req, res, next) => {
  if (isStripeWebhookRequest(req)) {
    return next();
  }

  return SanitizeRequestMiddleware(req, res, next);
});
app.use((req, res, next) => {
  if (isStripeWebhookRequest(req)) {
    return next();
  }

  return SuspiciousRequestMiddleware(req, res, next);
});

if (process.env.NODE_ENV !== 'test' && enableRequestLogging) {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'RindaSeat API',
    status: 'running'
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const legacyHealthHandler = (req, res) => {
  const report = generateHealthReport();

  res.json({
    server: report.server.status,
    database: report.database.status,
    tables: report.database.tables,
    integrations: report.integrations.payment,
    notifications: report.integrations.notification,
    uptime: report.server.uptime,
    environment: report.server.environment,
    health: report.health.overall,
    timestamp: report.timestamp
  });
};

const apiHealthHandler = (req, res) => {
  const report = generateHealthReport();
  const databaseBootstrap = getDatabaseBootstrapStatus();

  res.json({
    server: 'running',
    database: report.database.status,
    databaseBootstrap: databaseBootstrap.state,
    environment: process.env.NODE_ENV || 'development',
    firebase: isFirebaseConfigured() ? 'connected' : 'degraded',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', legacyHealthHandler);
app.get('/api/health', apiHealthHandler);

app.use('/api', apiLimiter);
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }

  const bootstrap = await waitForDatabaseBootstrap();

  if (!bootstrap.success) {
    return res.status(503).json({
      success: false,
      message: 'Database is initializing or unavailable. Please retry shortly.',
      database: bootstrap.timedOut ? 'initializing' : 'degraded'
    });
  }

  return next();
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
