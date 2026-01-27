import { Router, Request, Response } from 'express';
import { getParam } from '../lib/route-helpers';
import { analyzeToken } from '../services/security/token-security';
import { globalRateLimiter } from '../middleware/security.middleware';

const router = Router();

const PUBLIC_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const FREE_TIER_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function publicRateLimiter(req: Request, res: Response, next: () => void) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = PUBLIC_RATE_LIMIT.get(ip);

  if (record && record.resetAt > now) {
    if (record.count >= FREE_TIER_LIMIT) {
      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000).toString());
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Free tier: 100 requests per hour',
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      });
    }
    record.count++;
  } else {
    PUBLIC_RATE_LIMIT.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }

  if (PUBLIC_RATE_LIMIT.size > 100000) {
    const oldestAllowed = now - RATE_LIMIT_WINDOW;
    for (const [key, value] of PUBLIC_RATE_LIMIT.entries()) {
      if (value.resetAt < oldestAllowed) {
        PUBLIC_RATE_LIMIT.delete(key);
      }
    }
  }

  next();
}

router.use(publicRateLimiter);

router.get('/public/security/score/:tokenAddress', async (req: Request, res: Response) => {
  const { tokenAddress } = req.params;

  if (!tokenAddress) {
    return res.status(400).json({ success: false, error: 'Token address required' });
  }

  try {
    const analysis = await analyzeToken(tokenAddress);

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Could not analyze token' });
    }

    res.json({
      success: true,
      tokenAddress,
      trustScore: analysis.trustScore.score,
      trustGrade: analysis.trustScore.grade,
      risks: analysis.trustScore.risks,
      passed: analysis.trustScore.passed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Public security score error:', error);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

router.get('/public/security/trending', async (req: Request, res: Response) => {
  try {
    const { getAllTrending } = await import('../services/security/safe-trending');
    const tokens = await getAllTrending();
    
    res.json({
      success: true,
      tokens: tokens.slice(0, 50).map(t => ({
        tokenAddress: t.address || '',
        trustScore: t.trustScore,
        trustGrade: t.trustGrade,
        liquidityUsd: t.liquidityUsd,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Public trending error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trending', tokens: [] });
  }
});

export default router;
