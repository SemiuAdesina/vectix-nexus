import { Request, Response, NextFunction } from 'express';

const IP_REQUEST_COUNTS = new Map<string, { count: number; resetAt: number }>();
const GLOBAL_RATE_LIMIT = parseInt(process.env.GLOBAL_RATE_LIMIT || '1000', 10);
const RATE_LIMIT_WINDOW_MS = 60000;

export function globalRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = IP_REQUEST_COUNTS.get(ip);

  if (record && record.resetAt > now) {
    if (record.count >= GLOBAL_RATE_LIMIT) {
      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000).toString());
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      });
    }
    record.count++;
  } else {
    IP_REQUEST_COUNTS.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  if (IP_REQUEST_COUNTS.size > 100000) {
    const oldestAllowed = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, value] of IP_REQUEST_COUNTS.entries()) {
      if (value.resetAt < oldestAllowed) {
        IP_REQUEST_COUNTS.delete(key);
      }
    }
  }

  next();
}

export function sensitiveDataFilter(req: Request, _res: Response, next: NextFunction) {
  const sensitiveFields = ['password', 'secret', 'token', 'privateKey', 'apiKey', 'encryptedSecrets'];

  const filterObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
        filtered[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        filtered[key] = filterObject(value as Record<string, unknown>);
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = filterObject(req.body);
  }

  next();
}
