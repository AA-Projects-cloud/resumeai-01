/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Global error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
