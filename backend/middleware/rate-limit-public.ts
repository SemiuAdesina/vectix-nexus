import { Request, Response, NextFunction } from 'express';
import { getStateStorage } from '../lib/state-storage';

const BUG_REPORT_LIMIT = 5;
const BUG_REPORT_WINDOW_MS = 60 * 60 * 1000;

export async function rateLimitBugReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = `bug-report:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`;
  const storage = getStateStorage();
  const now = Date.now();

  try {
    const current = await storage.getRateLimit(key);
    if (current && current.resetAt > now) {
      if (current.count >= BUG_REPORT_LIMIT) {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Try again later.',
          retryAfter: Math.ceil((current.resetAt - now) / 1000),
        });
        return;
      }
      await storage.incrementRateLimit(key);
    } else {
      await storage.setRateLimit(key, { count: 1, resetAt: now + BUG_REPORT_WINDOW_MS }, BUG_REPORT_WINDOW_MS);
    }
    next();
  } catch {
    next();
  }
}
