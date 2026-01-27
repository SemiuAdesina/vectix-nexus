import { Request, Response, NextFunction } from 'express';

export interface CorsConfig {
  trustedOrigins: string[];
}

const DEFAULT_CONFIG: CorsConfig = {
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || ['http://localhost:3000'],
};

export function secureCors(config: Partial<CorsConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && cfg.trustedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Request-ID');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  };
}
