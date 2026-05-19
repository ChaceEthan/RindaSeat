// @ts-nocheck
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  if (!isTest) {
    console.error(`[ERROR] ${error.message}`);

    if (isDevelopment && error.stack) {
      console.error(error.stack);
    }
  }

  // Don't expose internal error details in production
  const message = isDevelopment
    ? error.message || 'Internal server error'
    : getPublicErrorMessage(statusCode);

  const response = {
    success: false,
    message,
    ...(isDevelopment && error.code && { code: error.code }),
    ...(isDevelopment && error.stack && { stack: error.stack })
  };

  res.status(statusCode).json(response);
};

const getPublicErrorMessage = (statusCode) => {
  const messages = {
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    422: 'Unprocessable entity',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable'
  };

  return messages[statusCode] || 'An error occurred';
};

module.exports = {
  notFound,
  errorHandler
};
