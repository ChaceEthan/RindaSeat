// @ts-nocheck
/**
 * Additional Security Middleware
 * Provides extra security hardening beyond helmet
 */

const BLOCKED_PATHS = [
  '/admin',
  '/api/admin',
  '/.env',
  '/config',
  '/.git',
  '/node_modules',
  '/etc/passwd',
  '/etc/shadow'
];

const BlockedPathMiddleware = (req, res, next) => {
  const path = req.path.toLowerCase();

  if (BLOCKED_PATHS.some((blocked) => path.startsWith(blocked))) {
    console.warn(`[SECURITY] Blocked path attempt: ${path}`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden'
    });
  }

  return next();
};

const RequestSizeMiddleware = (maxSize = 10 * 1024) => (req, res, next) => {
  const contentLength = Number(req.headers['content-length']) || 0;

  if (contentLength > maxSize) {
    console.warn(`[SECURITY] Request too large: ${contentLength} bytes`);
    return res.status(413).json({
      success: false,
      message: 'Request too large'
    });
  }

  return next();
};

const SecurityHeadersMiddleware = (req, res, next) => {
  // Additional headers beyond helmet
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove sensitive headers
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');

  return next();
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return value.replace(/\x00/g, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((clean, [key, nestedValue]) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        return clean;
      }

      clean[key] = sanitizeValue(nestedValue);
      return clean;
    }, {});
  }

  return value;
};

const SanitizeRequestMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  return next();
};

const SuspiciousRequestMiddleware = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /\x00/, // Null byte injection
    /union.*select/i, // SQL injection attempt
    /script|iframe|onclick|onerror/i, // XSS attempts
    /<|>|"'`/ // HTML/JS injection
  ];

  const checkValue = (value) => {
    if (typeof value !== 'string') {
      return false;
    }

    return suspiciousPatterns.some((pattern) => pattern.test(value));
  };

  // Check URL params
  if (checkValue(req.url)) {
    console.warn(`[SECURITY] Suspicious URL: ${req.url}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid request'
    });
  }

  // Check body if present
  if (req.body && typeof req.body === 'object') {
    const keys = Object.keys(req.body);

    for (const key of keys) {
      if (checkValue(key) || checkValue(req.body[key])) {
        console.warn(`[SECURITY] Suspicious request body: ${key}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid request'
        });
      }
    }
  }

  return next();
};

module.exports = {
  BlockedPathMiddleware,
  RequestSizeMiddleware,
  SanitizeRequestMiddleware,
  SecurityHeadersMiddleware,
  SuspiciousRequestMiddleware
};
