import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // Capture details to stderr console
  console.error(`[EXPRESS SYSTEM ERROR]: ${err.name} - ${err.message}`);
  if (env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Handle specific database or validation error formats
  const statusCode = err.statusCode || 500;
  let message = err.message || 'A critical system error occurred on our server.';

  // Sanitize database/backend errors
  if (
    message.toLowerCase().includes('sql') || 
    message.toLowerCase().includes('foreign key') || 
    message.toLowerCase().includes('constraint') ||
    message.toLowerCase().includes('database') ||
    err.code?.startsWith('ER_')
  ) {
    message = 'An unexpected internal system error occurred. Please try again later.';
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Handle unmatched wildcard routes
export const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    success: false,
    error: `Endpoint Resource Not Found: [${req.method}] ${req.originalUrl}`
  });
};
