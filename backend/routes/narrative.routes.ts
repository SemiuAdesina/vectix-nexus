import { Router, Request, Response } from 'express';
import { narrativeService } from '../services/narrative/narrative-service';

const router = Router();

router.get('/narrative/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    available: narrativeService.isAvailable(),
    message: narrativeService.isAvailable()
      ? 'Narrative tracking is active'
      : 'Add LUNARCRUSH_API_KEY to enable narrative tracking',
  });
});

router.get('/narrative/clusters', async (_req: Request, res: Response) => {
  if (!narrativeService.isAvailable()) {
    return res.json({ success: false, clusters: [], message: 'Feature not configured' });
  }
  const clusters = await narrativeService.getClusters();
  res.json({ success: true, clusters });
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
    return res.json({ success: false, signals: [], message: 'Feature not configured' });
  }
  const signals = await narrativeService.getSignals();
  res.json({ success: true, signals });
});

export default router;

