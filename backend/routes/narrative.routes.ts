import { Router, Request, Response } from 'express';
import { narrativeService } from '../services/narrative/narrative-service';

const router = Router();

router.get('/narrative/status', (_req: Request, res: Response) => {
  const isDemo = process.env.ENABLE_NARRATIVE_DEMO === 'true' || process.env.NODE_ENV === 'development';
  const available = narrativeService.isAvailable();
  
  res.json({
    success: true,
    available,
    demoMode: isDemo && !process.env.LUNARCRUSH_API_KEY,
    message: available
      ? (isDemo && !process.env.LUNARCRUSH_API_KEY 
          ? 'Narrative tracking (Demo Mode) - Using mock data for testing'
          : 'Narrative tracking is active')
      : 'Add LUNARCRUSH_API_KEY to enable narrative tracking',
  });
});

router.get('/narrative/clusters', async (_req: Request, res: Response) => {
  if (!narrativeService.isAvailable()) {
    return res.status(503).json({ 
      success: false, 
      clusters: [], 
      message: 'Feature not configured. Add LUNARCRUSH_API_KEY to enable.' 
    });
  }
  try {
    const clusters = await narrativeService.getClusters();
    res.json({ success: true, clusters, count: clusters.length });
  } catch (error) {
    console.error('Failed to fetch clusters:', error);
    res.status(500).json({ success: false, clusters: [], message: 'Failed to fetch clusters' });
  }
});

router.get('/narrative/hot', async (req: Request, res: Response) => {
  if (!narrativeService.isAvailable()) {
    return res.json({ success: false, clusters: [], message: 'Feature not configured' });
  }
  const limit = parseInt(req.query.limit as string) || 5;
  const clusters = await narrativeService.getHottestClusters(limit);
  res.json({ success: true, clusters });
});

router.get('/narrative/signals', async (_req: Request, res: Response) => {
  if (!narrativeService.isAvailable()) {
    return res.status(503).json({ 
      success: false, 
      signals: [], 
      message: 'Feature not configured. Add LUNARCRUSH_API_KEY to enable.' 
    });
  }
  try {
    const signals = await narrativeService.getSignals();
    res.json({ success: true, signals, count: signals.length });
  } catch (error) {
    console.error('Failed to fetch signals:', error);
    res.status(500).json({ success: false, signals: [], message: 'Failed to fetch signals' });
  }
});

export default router;

