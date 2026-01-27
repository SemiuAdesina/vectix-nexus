import { Router, Request, Response } from 'express';
import {
  generateReferralCode,
  applyReferralCode,
  getAffiliateStats,
  recordReferralEarning,
} from '../services/affiliate/affiliate.service';
import { getParam } from '../lib/route-helpers';

const router = Router();

router.get('/affiliate/stats/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getParam(req, 'userId');
    const stats = await getAffiliateStats(userId);
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get affiliate stats' });
  }
});

router.post('/affiliate/generate-code', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID required' });
      return;
    }

    const code = await generateReferralCode(userId);
    res.json({ success: true, referralCode: code });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate referral code' });
  }
});

router.post('/affiliate/apply-code', async (req: Request, res: Response) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      res.status(400).json({ success: false, error: 'User ID and referral code required' });
      return;
    }

    const applied = await applyReferralCode(userId, referralCode);

    if (!applied) {
      res.status(400).json({ success: false, error: 'Invalid referral code' });
      return;
    }

    res.json({ success: true, message: 'Referral code applied' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to apply referral code' });
  }
});

router.post('/affiliate/record-earning', async (req: Request, res: Response) => {
  try {
    const { referrerId, sourceUserId, tradingFee, txHash } = req.body;
    await recordReferralEarning(referrerId, sourceUserId, tradingFee, txHash);
    res.json({ success: true, message: 'Earning recorded' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to record earning' });
  }
});

export default router;

