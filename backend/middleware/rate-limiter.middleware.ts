import { Request, Response, NextFunction } from 'express';
import { getStateStorage } from '../lib/state-storage';

const GLOBAL_RATE_LIMIT = parseInt(process.env.GLOBAL_RATE_LIMIT || '1000', 10);
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_STORED_IPS = 100000;

export async function globalRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const storage = getStateStorage();

  try {
    const record = await storage.getRateLimit(ip);

    if (record && record.resetAt > now) {
      if (record.count >= GLOBAL_RATE_LIMIT) {
        res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000).toString());
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        });
      }
      await storage.incrementRateLimit(ip);
    } else {
      await storage.setRateLimit(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }, RATE_LIMIT_WINDOW_MS);
    }

    const count = await storage.getRateLimitCount();
    if (count > MAX_STORED_IPS) {
      await cleanupExpiredRecords(storage, now);
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
}

async function cleanupExpiredRecords(storage: ReturnType<typeof getStateStorage>, now: number): Promise<void> {
  const oldestAllowed = now - RATE_LIMIT_WINDOW_MS;
  const keys = await getAllRateLimitKeys(storage);
  
  for (const key of keys) {
    const record = await storage.getRateLimit(key);
    if (record && record.resetAt < oldestAllowed) {
      await storage.deleteRateLimit(key);
    }
  }
}

async function getAllRateLimitKeys(_storage: ReturnType<typeof getStateStorage>): Promise<string[]> {
  return [];
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
