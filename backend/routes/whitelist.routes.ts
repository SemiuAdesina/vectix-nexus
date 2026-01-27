import { Router, Request, Response } from 'express';
import { getParam } from '../lib/route-helpers';
import {
  getWhitelistStatus,
  setWhitelistedWallet,
  checkWithdrawalAllowed,
} from '../services/security/whitelist.service';

const router = Router();

router.get('/agent/:agentId/whitelist', async (req: Request, res: Response) => {
  try {
    const agentId = getParam(req, 'agentId');
    const status = await getWhitelistStatus(agentId);

    if (!status) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get whitelist status' });
  }
});

router.post('/agent/:agentId/whitelist', async (req: Request, res: Response) => {
  try {
    const agentId = getParam(req, 'agentId');
    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(400).json({ success: false, error: 'Wallet address required' });
      return;
    }

    const result = await setWhitelistedWallet(agentId, walletAddress);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update whitelist';
    res.status(400).json({ success: false, error: message });
  }
});

router.post('/agent/:agentId/whitelist/check', async (req: Request, res: Response) => {
  try {
    const agentId = getParam(req, 'agentId');
    const { destinationWallet } = req.body;

    const result = await checkWithdrawalAllowed(agentId, destinationWallet);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check withdrawal' });
  }
});

export default router;

