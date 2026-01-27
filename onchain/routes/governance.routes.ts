import { Router, Request, Response } from 'express';
import { governanceService } from '../services/governance';

const router = Router();

router.post('/onchain/governance/proposal', async (req: Request, res: Response) => {
  try {
    const proposal = await governanceService.createProposal(req.body);
    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to create proposal' });
  }
});

router.post('/onchain/governance/vote', async (req: Request, res: Response) => {
  try {
    const { proposalId, ...vote } = req.body;
    const result = await governanceService.vote(proposalId, vote);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Vote failed. You may have already voted on this proposal or the proposal is not active.' });
    }
  } catch (error) {
    console.error('Failed to vote:', error);
    res.status(500).json({ success: false, error: 'Failed to vote' });
  }
});

router.get('/onchain/governance/proposals', async (req: Request, res: Response) => {
  try {
    const proposals = await governanceService.getActiveProposals();
    res.json({ success: true, proposals });
  } catch (error) {
    console.error('Failed to get proposals:', error);
    res.status(500).json({ success: false, error: 'Failed to get proposals' });
  }
});

router.get('/onchain/governance/proposal/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const proposal = await governanceService.getProposal(id);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Failed to get proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to get proposal' });
  }
});

router.post('/onchain/governance/execute', async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.body;
    const result = await governanceService.executeProposal(proposalId);
    res.json({ success: result });
  } catch (error) {
    console.error('Failed to execute proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to execute proposal' });
  }
});

export default router;
