import { Router, Request, Response } from 'express';
import { auditTrailService } from '../services/audit-trail';

const router = Router();

router.get('/onchain/audit-trail', async (req: Request, res: Response) => {
  try {
    const query = {
      agentId: req.query.agentId as string | undefined,
      tokenAddress: req.query.tokenAddress as string | undefined,
      decision: req.query.decision as 'approved' | 'rejected' | 'pending' | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    const result = await auditTrailService.queryTrail(query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to query audit trail:', error);
    res.status(500).json({ success: false, error: 'Failed to query audit trail' });
  }
});

router.get('/onchain/audit-trail/verify', async (req: Request, res: Response) => {
  try {
    const result = await auditTrailService.verifyTrailIntegrity();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to verify audit trail:', error);
    res.status(500).json({ success: false, error: 'Failed to verify audit trail' });
  }
});

router.get('/onchain/audit-trail/export', async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as 'json' | 'csv') || 'json';
    const data = await auditTrailService.exportTrail(format);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-trail.${format}`);
    res.send(data);
  } catch (error) {
    console.error('Failed to export audit trail:', error);
    res.status(500).json({ success: false, error: 'Failed to export audit trail' });
  }
});

export default router;
