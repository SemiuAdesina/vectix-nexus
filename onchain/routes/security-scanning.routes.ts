import { Router, Request, Response } from 'express';
import { securityScanningService } from '../services/security-scanning';

const router = Router();

router.post('/onchain/security/scan', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.body;
    const result = await securityScanningService.scanToken(tokenAddress);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to scan token:', error);
    res.status(500).json({ success: false, error: 'Failed to scan token' });
  }
});

router.get('/onchain/security/alerts', async (req: Request, res: Response) => {
  try {
    const filters = {
      severity: req.query.severity as string | undefined,
      tokenAddress: req.query.tokenAddress as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    const alerts = await securityScanningService.getAlerts(filters);
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Failed to get alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to get alerts' });
  }
});

export default router;
