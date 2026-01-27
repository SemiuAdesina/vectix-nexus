import { Router, Request, Response } from 'express';
import { toggleMevProtection, calculateTurboFee } from '../services/security/mev-protection.service';
import { checkWalletSanctions, screenUserWallet } from '../services/security/sanctions.service';

const router = Router();

router.post('/agent/:agentId/mev-protection', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { enabled } = req.body;

    const result = await toggleMevProtection(agentId, enabled);
    res.json({ success: true, mevProtectionEnabled: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update MEV protection' });
  }
});

router.get('/turbo/fees', (_req: Request, res: Response) => {
  const fees = calculateTurboFee();
  res.json({ success: true, ...fees });
});

router.post('/sanctions/check', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(400).json({ success: false, error: 'Wallet address required' });
      return;
    }

    const result = await checkWalletSanctions(walletAddress);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check sanctions' });
  }
});

router.post('/sanctions/screen-user', async (req: Request, res: Response) => {
  try {
    const { userId, walletAddress } = req.body;

    if (!userId || !walletAddress) {
      res.status(400).json({ success: false, error: 'User ID and wallet address required' });
      return;
    }

    const result = await screenUserWallet(userId, walletAddress);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to screen wallet' });
  }
});

export default router;

