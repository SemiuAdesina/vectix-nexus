import { Router, Response } from 'express';
import { requireScope, ApiAuthRequest } from '../../middleware/api-auth.middleware';

const router = Router();

router.get('/market/trending', requireScope('read:market'), async (req: ApiAuthRequest, res: Response) => {
  const delayed = req.apiAuth!.tier === 'free';
  const delayMs = delayed ? 15 * 60 * 1000 : 0;
  const dataTimestamp = new Date(Date.now() - delayMs).toISOString();
  res.json({ delayed, dataTimestamp, message: delayed ? 'Data delayed 15 minutes' : 'Real-time', tokens: [] });
});

export default router;
