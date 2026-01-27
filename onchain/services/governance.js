"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.governanceService = exports.GovernanceService = void 0;
const PROPOSALS = new Map();
const VOTES = new Map();
class GovernanceService {
    async createProposal(proposal) {
        const id = `proposal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const govProposal = {
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
    async vote(proposalId, vote) {
        const proposal = PROPOSALS.get(proposalId);
        if (!proposal || proposal.status !== 'active')
            return false;
        const existingVotes = VOTES.get(proposalId) || [];
        if (existingVotes.some(v => v.voter === vote.voter))
            return false;
        const govVote = {
            id: `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            ...vote,
            timestamp: new Date(),
        };
        existingVotes.push(govVote);
        VOTES.set(proposalId, existingVotes);
        if (vote.support) {
            proposal.votesFor += vote.weight;
        }
        else {
            proposal.votesAgainst += vote.weight;
        }
        if (proposal.votesFor >= proposal.quorum) {
            proposal.status = 'passed';
        }
        else if (proposal.votesAgainst > proposal.votesFor && proposal.votesAgainst >= proposal.quorum) {
            proposal.status = 'rejected';
        }
        return true;
    }
    async getProposal(proposalId) {
        return PROPOSALS.get(proposalId) || null;
    }
    async getActiveProposals() {
        return Array.from(PROPOSALS.values())
            .filter(p => p.status === 'active')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async executeProposal(proposalId) {
        const proposal = PROPOSALS.get(proposalId);
        if (!proposal || proposal.status !== 'passed')
            return false;
        proposal.status = 'executed';
        proposal.executedAt = new Date();
        return true;
    }
}
exports.GovernanceService = GovernanceService;
exports.governanceService = new GovernanceService();
