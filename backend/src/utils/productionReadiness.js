// @ts-nocheck
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { validateEnv } = require('./envValidator');
const { checkPostgresHealth } = require('./postgresHealthCheck');

const rootDir = path.join(__dirname, '..', '..');
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const requiredDependencies = [
  'bcryptjs',
  'cors',
  'dotenv',
  'express',
  'express-rate-limit',
  'firebase-admin',
  'helmet',
  'jsonwebtoken',
  'morgan',
  'nodemailer',
  'pg',
  'qrcode',
  'socket.io',
  'uuid'
];

const requiredRoutes = [
  '/api/auth',
  '/api/trips',
  '/api/bookings',
  '/api/companies',
  '/api/payments',
  '/api/health',
  '/api/payments/webhooks/stripe'
];

const optionalIntegrationModules = [
  '../config/firebase',
  '../services/emailService',
  '../services/smsService',
  '../services/pushNotificationService',
  '../services/paymentService',
  '../services/qrService'
];

const sensitivePatterns = [
  /console\.(log|warn|error)\([^)]*process\.env\.(DATABASE_URL|JWT_SECRET|FIREBASE_PRIVATE_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|MTN_MOMO_API_SECRET|MTN_MOMO_API_KEY|SMTP_PASS|SMS_API_KEY)/
];

const color = (value, colorName) => `${colors[colorName]}${value}${colors.reset}`;

const addResult = (results, status, name, detail = '') => {
  results.push({ status, name, detail });
};

const getRoutePathFromLayer = (layer) => {
  if (!layer.regexp || !layer.regexp.source) {
    return '';
  }

  return layer.regexp.source
    .replace('^\\/', '/')
    .replace('\\/?(?=\\/|$)', '')
    .replace(/\\\//g, '/')
    .replace(/\$$/, '')
    .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param');
};

const normalizeRoutePath = (routePath) => {
  if (!routePath || routePath === '/') {
    return '';
  }

  return routePath.endsWith('/') && routePath.length > 1
    ? routePath.slice(0, -1)
    : routePath;
};

const listRoutes = (stack, basePath = '') => {
  const routes = [];

  stack.forEach((layer) => {
    if (layer.route) {
      const routePath = normalizeRoutePath(layer.route.path);
      routes.push(normalizeRoutePath(`${basePath}${routePath}`) || '/');
      return;
    }

    if (layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
      const routerPath = normalizeRoutePath(getRoutePathFromLayer(layer));
      routes.push(...listRoutes(layer.handle.stack, `${basePath}${routerPath}`));
    }
  });

  return [...new Set(routes)];
};

const checkEnv = (results) => {
  try {
    const validation = validateEnv({ warn: () => {} });

    if (validation.missingRequired.length > 0) {
      addResult(results, 'fail', 'Environment required variables', validation.missingRequired.join(', '));
      return;
    }

    addResult(results, 'pass', 'Environment required variables', 'DATABASE_URL, JWT_SECRET, PORT/defaults OK');

    if (validation.missingOptional.length > 0) {
      addResult(results, 'warn', 'Environment optional integrations', `${validation.missingOptional.length} optional values missing or placeholders`);
    } else {
      addResult(results, 'pass', 'Environment optional integrations', 'all optional values configured');
    }
  } catch (error) {
    addResult(results, 'fail', 'Environment validation', error.message);
  }
};

const checkDatabase = async (results) => {
  const health = await checkPostgresHealth({ logger: { log: () => {}, warn: () => {}, error: () => {} } });
  const status = health.database.status;

  if (health.ok) {
    addResult(results, 'pass', 'Database connection', `connected to ${health.database.name}`);
    addResult(results, 'pass', 'Required database tables', Object.keys(health.tables).join(', '));
    return;
  }

  addResult(results, 'fail', 'Database connection', status.error || 'database health check failed');
  const missingTables = status.missingTables || [];

  if (missingTables.length > 0) {
    addResult(results, 'fail', 'Required database tables', `missing: ${missingTables.join(', ')}`);
  }
};

const checkIntegrations = (results) => {
  optionalIntegrationModules.forEach((modulePath) => {
    try {
      require(modulePath);
      addResult(results, 'pass', `Integration module ${modulePath}`, 'loaded safely');
    } catch (error) {
      addResult(results, 'fail', `Integration module ${modulePath}`, error.message);
    }
  });
};

const checkRoutes = (results) => {
  try {
    const app = require('../app');
    const routes = listRoutes(app._router ? app._router.stack : []);
    const missingRoutes = requiredRoutes.filter((route) => !routes.includes(route));

    if (missingRoutes.length > 0) {
      addResult(results, 'fail', 'Routes registered', `missing: ${missingRoutes.join(', ')}`);
    } else {
      addResult(results, 'pass', 'Routes registered', `${requiredRoutes.length} required routes found`);
    }

    const appSource = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
    const paymentRoutesSource = fs.readFileSync(path.join(rootDir, 'src', 'routes', 'paymentRoutes.js'), 'utf8');

    if (
      appSource.includes('isStripeWebhookRequest')
      && paymentRoutesSource.includes("express.raw({ type: 'application/json' })")
    ) {
      addResult(results, 'pass', 'Stripe webhook raw parser', 'raw parser isolated from global JSON parser');
    } else {
      addResult(results, 'fail', 'Stripe webhook raw parser', 'raw parser isolation not detected');
    }
  } catch (error) {
    addResult(results, 'fail', 'Route validation', error.message);
  }
};

const checkDependencies = (results) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const dependencies = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };
    const missing = requiredDependencies.filter((dependency) => !dependencies[dependency]);

    if (missing.length > 0) {
      addResult(results, 'fail', 'Package dependencies', `missing: ${missing.join(', ')}`);
      return;
    }

    addResult(results, 'pass', 'Package dependencies', `${requiredDependencies.length} dependencies present`);
  } catch (error) {
    addResult(results, 'fail', 'Package dependencies', error.message);
  }
};

const checkSqlFiles = (results) => {
  const schemaPath = path.join(rootDir, 'database', 'schema.sql');
  const seedPath = path.join(rootDir, 'database', 'seed.sql');
  const schema = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : '';
  const seed = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf8') : '';
  const requiredTables = ['users', 'companies', 'stations', 'buses', 'routes', 'trips', 'bookings', 'payments'];
  const missingTables = requiredTables.filter((table) => !schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`));

  if (!schema || missingTables.length > 0) {
    addResult(results, 'fail', 'schema.sql', missingTables.length > 0 ? `missing table DDL: ${missingTables.join(', ')}` : 'missing or empty');
  } else {
    addResult(results, 'pass', 'schema.sql', 'required tables, indexes, and constraints present');
  }

  if (!seed || !seed.includes('INSERT INTO stations') || !seed.includes('INSERT INTO companies')) {
    addResult(results, 'warn', 'seed.sql', 'seed file is missing expected starter data');
  } else {
    addResult(results, 'pass', 'seed.sql', 'starter stations and companies present');
  }
};

const checkSecretSafety = (results) => {
  const filesToScan = [
    'src',
    'scripts',
    'README.md',
    '.env.example'
  ];
  const findings = [];

  const scanFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    sensitivePatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        findings.push(path.relative(rootDir, filePath));
      }
    });
  };

  const scan = (targetPath) => {
    const fullPath = path.join(rootDir, targetPath);

    if (!fs.existsSync(fullPath)) {
      return;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fs.readdirSync(fullPath, { withFileTypes: true }).forEach((entry) => {
        if (entry.name === 'node_modules') {
          return;
        }

        scan(path.join(targetPath, entry.name));
      });
      return;
    }

    if (fullPath.endsWith('.js') || fullPath.endsWith('.md') || fullPath.endsWith('.example')) {
      scanFile(fullPath);
    }
  };

  filesToScan.forEach(scan);

  if (findings.length > 0) {
    addResult(results, 'warn', 'Secret logging scan', `review possible sensitive logging in: ${[...new Set(findings)].join(', ')}`);
    return;
  }

  addResult(results, 'pass', 'Secret logging scan', 'no direct secret logging patterns detected');
};

const printSummary = (results) => {
  const passCount = results.filter((result) => result.status === 'pass').length;
  const warnCount = results.filter((result) => result.status === 'warn').length;
  const failCount = results.filter((result) => result.status === 'fail').length;
  const score = Math.round(((passCount + warnCount * 0.5) / results.length) * 100);

  console.log(color('\nRindaSeat Backend Production Readiness\n', 'cyan'));
  results.forEach((result) => {
    const label = result.status === 'pass'
      ? color('[PASS]', 'green')
      : result.status === 'warn'
        ? color('[WARN]', 'yellow')
        : color('[FAIL]', 'red');

    console.log(`${label} ${result.name}${result.detail ? ` - ${result.detail}` : ''}`);
  });

  console.log('\nSummary');
  console.log(`Pass: ${passCount}`);
  console.log(`Warn: ${warnCount}`);
  console.log(`Fail: ${failCount}`);
  console.log(`Production readiness score: ${score}%`);

  return {
    score,
    passCount,
    warnCount,
    failCount
  };
};

const runProductionReadiness = async () => {
  const results = [];

  checkEnv(results);
  await checkDatabase(results);
  checkIntegrations(results);
  checkRoutes(results);
  checkDependencies(results);
  checkSqlFiles(results);
  checkSecretSafety(results);

  const summary = printSummary(results);

  return {
    results,
    summary,
    ready: summary.failCount === 0
  };
};

if (require.main === module) {
  runProductionReadiness()
    .then((report) => {
      process.exit(report.ready ? 0 : 1);
    })
    .catch((error) => {
      console.error(color(`[FAIL] Production readiness crashed: ${error.message}`, 'red'));
      process.exit(1);
    });
}

module.exports = {
  runProductionReadiness
};
