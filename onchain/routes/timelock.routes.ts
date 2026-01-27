import { Router, Request, Response } from 'express';
import { timeLockService } from '../services/time-lock';

const router = Router();

router.post('/onchain/timelock/create', async (req: Request, res: Response) => {
  try {
    const { executeAt, cancelWindow, ...rest } = req.body;
    const timelock = await timeLockService.createTimeLock({
      ...rest,
      executeAt: new Date(executeAt),
      cancelWindow,
    });
    res.json({ success: true, timelock });
  } catch (error) {
    console.error('Failed to create timelock:', error);
    res.status(500).json({ success: false, error: 'Failed to create timelock' });
  }
});

router.post('/onchain/timelock/cancel/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await timeLockService.cancelTimeLock(id);
    res.json({ success: result });
  } catch (error) {
    console.error('Failed to cancel timelock:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel timelock' });
  }
});

router.get('/onchain/timelock/pending', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.query;
    if (!agentId || typeof agentId !== 'string') {
      return res.status(400).json({ success: false, error: 'agentId required' });
    }
    const timelocks = await timeLockService.getPendingTimeLocks(agentId);
    res.json({ success: true, timelocks });
  } catch (error) {
    console.error('Failed to get pending timelocks:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending timelocks' });
  }
});

export default router;
