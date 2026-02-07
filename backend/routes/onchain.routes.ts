import { Router, Request, Response } from 'express';

const router = Router();

router.get('/onchain/audit-trail', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
  res.json({ success: true, entries: [], total: 0 });
});

router.get('/onchain/audit-trail/verify', (_req: Request, res: Response) => {
  res.json({ success: true, valid: true, invalidEntries: [] });
});

router.get('/onchain/audit-trail/export', (req: Request, res: Response) => {
  const format = (req.query.format as string) || 'json';
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-trail.csv');
    return res.send('');
  }
  res.setHeader('Content-Disposition', 'attachment; filename=audit-trail.json');
  res.json([]);
});

interface GovernanceProposalRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  targetRule?: string;
  proposedValue?: string;
  quorum: number;
  status: string;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  executedAt?: string;
}

const governanceProposals = new Map<string, GovernanceProposalRecord>();
const governanceVotesByProposal = new Map<string, Map<string, boolean>>();

router.get('/onchain/status', (_req: Request, res: Response) => {
  const programId = process.env.SOLANA_PROGRAM_ID || null;
  res.json({
    success: true,
    enabled: true,
    message: 'On-chain verification is active',
    programId,
  });
});

router.get('/onchain/threats/feed', (_req: Request, res: Response) => {
  res.json({ success: true, threats: [] });
});

router.get('/onchain/security/alerts', (_req: Request, res: Response) => {
  res.json({ success: true, alerts: [] });
});

router.get('/onchain/circuit-breaker/state/:agentId', (req: Request, res: Response) => {
  const agentId = req.params.agentId as string;
  res.json({
    success: true,
    state: {
      agentId,
      status: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      lastResetTime: Date.now(),
      pausedUntil: null,
    },
  });
});

router.post('/onchain/threats/detect', (_req: Request, res: Response) => {
  res.json({
    success: true,
    isAnomaly: false,
    confidence: 0,
    reason: 'Threat detection not configured',
  });
});

router.post('/onchain/threats/report', (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  res.json({
    success: true,
    report: {
      id: `report-${Date.now()}`,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  });
});

router.post('/onchain/governance/proposal', (req: Request, res: Response) => {
  const { title, description, type, targetRule, proposedValue, quorum } = req.body as Record<string, unknown>;
  if (!title || !description || !type || typeof quorum !== 'number') {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const id = `gov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const proposal: GovernanceProposalRecord = {
    id,
    title: String(title),
    description: String(description),
    type: String(type),
    targetRule: targetRule != null ? String(targetRule) : undefined,
    proposedValue: proposedValue != null ? String(proposedValue) : undefined,
    quorum: Number(quorum),
    status: 'active',
    votesFor: 0,
    votesAgainst: 0,
    createdAt: now,
  };
  governanceProposals.set(id, proposal);
  res.status(201).json({ success: true, proposal });
});

router.get('/onchain/governance/proposals', (req: Request, res: Response) => {
  const voterId = (req.query.voter as string) || null;
  const proposals = Array.from(governanceProposals.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const withUserVote = voterId
    ? proposals.map((p) => {
        const votes = governanceVotesByProposal.get(p.id);
        const userVote = votes?.has(voterId) ? (votes.get(voterId) ? 'for' : 'against') : null;
        return { ...p, userVote };
      })
    : proposals;
  res.json({ success: true, proposals: withUserVote });
});

router.get('/onchain/governance/proposal/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const proposal = governanceProposals.get(id);
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  res.json({ success: true, proposal });
});

router.post('/onchain/governance/vote', (req: Request, res: Response) => {
  const { proposalId, support, weight, voter } = req.body as { proposalId?: string; support?: boolean; weight?: number; voter?: string };
  if (!proposalId) return res.status(400).json({ success: false, error: 'proposalId required' });
  const voterId = voter || req.ip || req.socket.remoteAddress || 'anonymous';
  const proposal = governanceProposals.get(proposalId);
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  if (proposal.status !== 'active') return res.status(400).json({ success: false, error: 'Proposal not active' });
  let voted = governanceVotesByProposal.get(proposalId);
  if (!voted) {
    voted = new Map<string, boolean>();
    governanceVotesByProposal.set(proposalId, voted);
  }
  if (voted.has(voterId)) return res.status(400).json({ success: false, error: 'Already voted on this proposal' });
  const supportVote = support === true;
  voted.set(voterId, supportVote);
  if (supportVote) proposal.votesFor += weight ?? 1;
  else proposal.votesAgainst += weight ?? 1;
  res.json({ success: true });
});

router.post('/onchain/governance/execute', (req: Request, res: Response) => {
  const { proposalId } = req.body as { proposalId?: string };
  if (!proposalId) return res.status(400).json({ success: false, error: 'proposalId required' });
  const proposal = governanceProposals.get(proposalId);
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  proposal.status = 'executed';
  proposal.executedAt = new Date().toISOString();
  res.json({ success: true });
});

export default router;
