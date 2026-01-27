import type { GovernanceProposal, GovernanceVote, GovernanceConfig } from './onchain-types';

const PROPOSALS: Map<string, GovernanceProposal> = new Map();
const VOTES: Map<string, GovernanceVote[]> = new Map();

export class GovernanceService {
  async createProposal(proposal: Omit<GovernanceProposal, 'id' | 'status' | 'votesFor' | 'votesAgainst' | 'createdAt'>): Promise<GovernanceProposal> {
    const id = `proposal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const govProposal: GovernanceProposal = {
      id,
      ...proposal,
      status: 'active',
      votesFor: 0,
      votesAgainst: 0,
      createdAt: new Date(),
    };

    PROPOSALS.set(id, govProposal);
    VOTES.set(id, []);
    return govProposal;
  }

  async vote(proposalId: string, vote: Omit<GovernanceVote, 'id' | 'timestamp'>): Promise<boolean> {
    const proposal = PROPOSALS.get(proposalId);
    if (!proposal || proposal.status !== 'active') return false;

    const existingVotes = VOTES.get(proposalId) || [];
    if (existingVotes.some(v => v.voter === vote.voter)) return false;

    const govVote: GovernanceVote = {
      id: `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...vote,
      timestamp: new Date(),
    };

    existingVotes.push(govVote);
    VOTES.set(proposalId, existingVotes);

    if (vote.support) {
      proposal.votesFor += vote.weight;
    } else {
      proposal.votesAgainst += vote.weight;
    }

    if (proposal.votesFor >= proposal.quorum) {
      proposal.status = 'passed';
    } else if (proposal.votesAgainst > proposal.votesFor && proposal.votesAgainst >= proposal.quorum) {
      proposal.status = 'rejected';
    }

    return true;
  }

  async getProposal(proposalId: string): Promise<GovernanceProposal | null> {
    return PROPOSALS.get(proposalId) || null;
  }

  async getActiveProposals(): Promise<GovernanceProposal[]> {
    return Array.from(PROPOSALS.values())
      .filter(p => p.status === 'active')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async executeProposal(proposalId: string): Promise<boolean> {
    const proposal = PROPOSALS.get(proposalId);
    if (!proposal || proposal.status !== 'passed') return false;

    proposal.status = 'executed';
    proposal.executedAt = new Date();
    return true;
  }
}

export const governanceService = new GovernanceService();
