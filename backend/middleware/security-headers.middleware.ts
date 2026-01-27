import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export interface SecurityHeadersConfig {
  enableHsts: boolean;
  enableCsp: boolean;
  enableXssProtection: boolean;
  enableFrameGuard: boolean;
  enableContentTypeOptions: boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  enableHsts: true,
  enableCsp: true,
  enableXssProtection: true,
  enableFrameGuard: true,
  enableContentTypeOptions: true,
};

export function securityHeaders(config: Partial<SecurityHeadersConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return (_req: Request, res: Response, next: NextFunction) => {
    if (cfg.enableHsts) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    if (cfg.enableCsp) {
      const nonce = crypto.randomBytes(16).toString('base64');
      res.locals.cspNonce = nonce;
      res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.clerk.com https://*.clerk.accounts.dev",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '));
    }

    if (cfg.enableXssProtection) res.setHeader('X-XSS-Protection', '1; mode=block');
    if (cfg.enableFrameGuard) res.setHeader('X-Frame-Options', 'DENY');
    if (cfg.enableContentTypeOptions) res.setHeader('X-Content-Type-Options', 'nosniff');

    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.removeHeader('X-Powered-By');

    next();
  };
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
