import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Central Express error handler. Must be registered last (4 args).
 */
export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    logger.error(
      {
        err,
        method: req.method,
        url: req.url,
        body: req.body,
        userId: req.user?.userId,
      },
      'Unhandled server error',
    );
  } else {
    logger.warn(
      {
        statusCode,
        code: err.code,
        message: err.message,
        method: req.method,
        url: req.url,
      },
      'Client error',
    );
  }

  res.status(statusCode).json({
    error: isServerError ? 'Internal Server Error' : err.message,
    ...(err.code && { code: err.code }),
    ...(process.env.NODE_ENV === 'development' && isServerError && { stack: err.stack }),
  });
}

/**
 * Wrap an async route handler so thrown errors get forwarded to errorHandler.
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
