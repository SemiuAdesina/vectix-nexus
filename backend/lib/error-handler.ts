import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(400, code, message);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED'): AppError {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'Access denied', code = 'FORBIDDEN'): AppError {
    return new AppError(403, code, message);
  }

  static notFound(resource = 'Resource', code = 'NOT_FOUND'): AppError {
    return new AppError(404, code, `${resource} not found`);
  }

  static conflict(message: string, code = 'CONFLICT'): AppError {
    return new AppError(409, code, message);
  }

  static tooManyRequests(retryAfter: number, code = 'RATE_LIMITED'): AppError {
    const error = new AppError(429, code, 'Too many requests');
    (error as AppError & { retryAfter: number }).retryAfter = retryAfter;
    return error;
  }

  static internal(code = 'INTERNAL_ERROR'): AppError {
    return new AppError(500, code, 'An unexpected error occurred', false);
  }
}

const SENSITIVE_ERROR_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /credential/i,
  /database/i,
  /sql/i,
  /prisma/i,
  /connection/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
];

function sanitizeErrorMessage(message: string): string {
  for (const pattern of SENSITIVE_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return 'An error occurred while processing your request';
    }
  }
  return message.substring(0, 200);
}

function generateErrorId(): string {
  return `err_${crypto.randomBytes(8).toString('hex')}`;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errorId = generateErrorId();
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  const logEntry = {
    errorId,
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 100),
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  };

  console.error(JSON.stringify(logEntry));

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        errorId,
      },
      ...(err.statusCode === 429 && { retryAfter: (err as AppError & { retryAfter?: number }).retryAfter }),
    });
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = 500;
  const message = isProduction
    ? 'An unexpected error occurred'
    : sanitizeErrorMessage(err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      errorId,
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    },
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
