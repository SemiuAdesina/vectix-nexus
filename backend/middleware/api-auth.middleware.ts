import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/api-keys/api-key.service';
import { ApiScope, ApiTier, RATE_LIMITS } from '../services/api-keys/api-key.types';

export interface ApiAuthRequest extends Request {
  apiAuth?: {
    userId: string;
    scopes: ApiScope[];
    tier: ApiTier;
  };
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function apiKeyAuth(req: ApiAuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey || !apiKey.startsWith('vx_')) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  const validation = await validateApiKey(apiKey);
  if (!validation) {
    return res.status(401).json({ error: 'API key invalid or revoked' });
  }

  const limits = RATE_LIMITS[validation.tier];
  const now = Date.now();
  const windowStart = now - 60000;
  const key = `${apiKey}:minute`;

  const current = rateLimitStore.get(key);
  if (current && current.resetAt > now) {
    if (current.count >= limits.perMinute) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((current.resetAt - now) / 1000),
      });
    }
    current.count++;
  } else {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60000 });
  }

  req.apiAuth = validation;
  next();
}

export function requireScope(scope: ApiScope) {
  return (req: ApiAuthRequest, res: Response, next: NextFunction) => {
    if (!req.apiAuth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.apiAuth.scopes.includes(scope)) {
      return res.status(403).json({ error: `Missing required scope: ${scope}` });
    }

    next();
  };
}

export function requireTier(tier: ApiTier) {
  return (req: ApiAuthRequest, res: Response, next: NextFunction) => {
    if (!req.apiAuth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (tier === 'pro' && req.apiAuth.tier !== 'pro') {
      return res.status(403).json({ error: 'Pro subscription required for this endpoint' });
    }

    next();
  };
}

const pollingStore = new Map<string, number>();

export function requirePollingInterval(intervalMs: number) {
  return (req: ApiAuthRequest, res: Response, next: NextFunction) => {
    if (!req.apiAuth || req.apiAuth.tier === 'pro') {
      return next();
    }

    const key = `${req.headers['x-api-key']}:${req.path}`;
    const lastCall = pollingStore.get(key) || 0;
    const now = Date.now();

    if (now - lastCall < intervalMs) {
      const retryAfter = Math.ceil((intervalMs - (now - lastCall)) / 1000);
      return res.status(429).json({
        error: 'Polling too frequently. Free tier limited to 60s intervals.',
        retryAfter,
      });
    }

    pollingStore.set(key, now);
    next();
  };
}

