import { Router, Request, Response } from 'express';
import { getParam } from '../lib/route-helpers';
import { analyzeToken, shouldAutoReject, getSafeTrending, getAllTrending } from '../services/security';

const router = Router();

router.get('/security/analyze/:tokenAddress', async (req: Request, res: Response) => {
  const tokenAddress = getParam(req, 'tokenAddress');

  if (!tokenAddress) {
    res.status(400).json({ success: false, error: 'Token address required' });
    return;
  }

  try {
    const analysis = await analyzeToken(tokenAddress);

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Could not analyze token' });
      return;
    }

    res.json({ success: true, ...analysis });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

router.post('/security/check-trade', async (req: Request, res: Response) => {
  const { tokenAddress, safetyMode = true } = req.body;

  if (!tokenAddress) {
    res.status(400).json({ success: false, error: 'Token address required' });
    return;
  }

  try {
    const analysis = await analyzeToken(tokenAddress);

    if (!analysis) {
      res.json({
        success: true,
        approved: false,
        reason: 'Could not verify token safety',
      });
      return;
    }

    const decision = shouldAutoReject(analysis.trustScore.score, safetyMode);

    res.json({
      success: true,
      approved: !decision.reject,
      reason: decision.reason,
      trustScore: analysis.trustScore.score,
      trustGrade: analysis.trustScore.grade,
    });
  } catch (error) {
    console.error('Check trade error:', error);
    res.status(500).json({ success: false, error: 'Trade check failed' });
  }
});

router.get('/security/trending', async (_req: Request, res: Response) => {
  try {
    const tokens = await getAllTrending();
    res.json({ success: true, tokens });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trending', tokens: [] });
  }
});

router.get('/security/trending/safe', async (req: Request, res: Response) => {
  try {
    const minScore = parseInt(req.query.minScore as string) || 70;
    const tokens = await getSafeTrending(minScore);
    res.json({ success: true, tokens, filters: { minTrustScore: minScore } });
  } catch (error) {
    console.error('Safe trending error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch safe trending', tokens: [] });
  }
});

export default router;
