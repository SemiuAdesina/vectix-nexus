import { Router, Request, Response } from 'express';
import { multiSigService } from '../services/multisig';

const router = Router();

router.post('/onchain/multisig/create', async (req: Request, res: Response) => {
  try {
    const multisigId = await multiSigService.createMultiSig(req.body);
    res.json({ success: true, multisigId });
  } catch (error) {
    console.error('Failed to create multisig:', error);
    res.status(500).json({ success: false, error: 'Failed to create multisig' });
  }
});

router.post('/onchain/multisig/proposal', async (req: Request, res: Response) => {
  try {
    const { multisigId, ...proposal } = req.body;
    const result = await multiSigService.createProposal(multisigId, proposal);
    res.json({ success: true, proposal: result });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to create proposal' });
  }
});

export default router;
