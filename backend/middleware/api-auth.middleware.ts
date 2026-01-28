import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/api-keys/api-key.service';
import { ApiScope, ApiTier, RATE_LIMITS } from '../services/api-keys/api-key.types';
import { getStateStorage } from '../lib/state-storage';

export interface ApiAuthRequest extends Request {
  apiAuth?: {
    userId: string;
    scopes: ApiScope[];
    tier: ApiTier;
  };
}

const RATE_LIMIT_WINDOW_MS = 60000;

export async function apiKeyAuth(req: ApiAuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey || !apiKey.startsWith('vx_')) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  const validation = await validateApiKey(apiKey);
  if (!validation) {
    return res.status(401).json({ error: 'API key invalid or revoked' });
  }
  
  const storage = getStateStorage();
  const limits = RATE_LIMITS[validation.tier];
  const now = Date.now();
  const key = `apikey:${apiKey}:minute`;
  
  try {
    const current = await storage.getRateLimit(key);
    if (current && current.resetAt > now) {
      if (current.count >= limits.perMinute) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((current.resetAt - now) / 1000),
        });
      }
      await storage.incrementRateLimit(key);
    } else {
      await storage.setRateLimit(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }, RATE_LIMIT_WINDOW_MS);
    }
  } catch (error) {
    console.error('API rate limit error:', error);
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

export function requirePollingInterval(intervalMs: number) {
  return async (req: ApiAuthRequest, res: Response, next: NextFunction) => {
    if (!req.apiAuth) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const storage = getStateStorage();
    const apiKey = req.headers['x-api-key'] as string;
    const key = `polling:${apiKey}`;
    const now = Date.now();
    
    try {
      const record = await storage.getRateLimit(key);
      const lastRequest = record?.resetAt || 0;
      
      if (now - lastRequest < intervalMs) {
        return res.status(429).json({ 
          error: 'Polling interval not met',
          retryAfter: Math.ceil((intervalMs - (now - lastRequest)) / 1000),
        });
      }
      
      await storage.setRateLimit(key, { count: 1, resetAt: now }, intervalMs * 2);
    } catch (error) {
      console.error('Polling interval error:', error);
    }
    
    next();
  };
}
