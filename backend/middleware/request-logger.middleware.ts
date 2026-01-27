import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

const SENSITIVE_HEADERS = ['authorization', 'x-api-key', 'cookie'];
const SENSITIVE_BODY_KEYS = ['password', 'secret', 'token', 'apikey', 'privatekey'];

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_BODY_KEYS.some(s => lowerKey.includes(s))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

function getRequestId(req: Request): string | undefined {
  return req.headers['x-request-id'] as string | undefined;
}

function getUserId(req: Request): string | undefined {
  return (req as Request & { userId?: string }).userId;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = getRequestId(req);
  
  logger.request(req.method, req.path, { requestId, userId: getUserId(req) });
  
  if (process.env.LOG_LEVEL === 'debug' && req.body && Object.keys(req.body).length > 0) {
    logger.debug('Request body', { 
      requestId, 
      metadata: redactSensitive(req.body) 
    });
  }
  
  const originalEnd = res.end.bind(res);
  
  res.end = function(chunk?: unknown, encoding?: BufferEncoding | (() => void), cb?: () => void): Response {
    const duration = Date.now() - startTime;
    
    logger.response(req.method, req.path, res.statusCode, duration, { requestId });
    
    if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    }
    if (encoding) {
      return originalEnd(chunk, encoding, cb);
    }
    return originalEnd(chunk);
  };
  
  next();
}

export function errorLogger(
  err: Error, 
  req: Request, 
  _res: Response, 
  next: NextFunction
): void {
  const requestId = getRequestId(req);
  
  logger.error(`${err.name}: ${err.message}`, {
    context: 'ERROR',
    requestId,
    userId: getUserId(req),
    metadata: {
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
  
  next(err);
}
