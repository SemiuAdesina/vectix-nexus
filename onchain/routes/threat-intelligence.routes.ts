import { Router, Request, Response } from 'express';
import { threatIntelligenceService } from '../services/threat-intelligence';

const router = Router();

router.post('/onchain/threats/detect', async (req: Request, res: Response) => {
  try {
    const result = await threatIntelligenceService.detectAnomaly(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to detect threat:', error);
    res.status(500).json({ success: false, error: 'Failed to detect threat' });
  }
});

router.get('/onchain/threats/feed', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const feed = await threatIntelligenceService.getThreatFeed(limit);
    res.json({ success: true, threats: feed });
  } catch (error) {
    console.error('Failed to get threat feed:', error);
    res.status(500).json({ success: false, error: 'Failed to get threat feed' });
  }
});

router.post('/onchain/threats/report', async (req: Request, res: Response) => {
  try {
    const report = await threatIntelligenceService.reportThreat(req.body);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Failed to report threat:', error);
    res.status(500).json({ success: false, error: 'Failed to report threat' });
  }
});

export default router;
