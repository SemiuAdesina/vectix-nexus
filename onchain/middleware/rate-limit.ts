import { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const store = new Map<string, { count: number; resetAt: number }>();

function getClientId(req: Request): string {
  return (req.ip || req.socket?.remoteAddress || 'unknown').toString();
}

export function onchainRateLimit(req: Request, res: Response, next: NextFunction): void {
  const id = getClientId(req);
  const now = Date.now();
  let record = store.get(id);

  if (!record || record.resetAt <= now) {
    record = { count: 0, resetAt: now + WINDOW_MS };
    store.set(id, record);
  }

  record.count += 1;

  if (record.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
    res.status(429).json({ success: false, error: 'Too many requests' });
    return;
  }

  next();
}
