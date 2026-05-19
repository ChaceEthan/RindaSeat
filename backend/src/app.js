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
  SecurityHeadersMiddleware,
  SuspiciousRequestMiddleware
} = require('./middleware/securityMiddleware');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');
const companyRoutes = require('./routes/companyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { generateHealthReport } = require('./utils/healthCheck');

const app = express();
const stripeWebhookPath = '/api/payments/webhooks/stripe';
const allowedOrigins = (process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const maxRequestBodySize = Number(process.env.MAX_FILE_UPLOAD_SIZE) || 1024 * 1024;
const enableRequestLogging = process.env.ENABLE_REQUEST_LOGGING !== 'false';
const isStripeWebhookRequest = (req) => req.originalUrl.split('?')[0] === stripeWebhookPath;

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
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

  return express.urlencoded({ extended: true })(req, res, next);
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

const healthHandler = (req, res) => {
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

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
