import { describe, it, expect, beforeEach } from 'vitest';
import { GovernanceService } from './governance';
import type { GovernanceProposal, GovernanceVote } from './onchain-types';

describe('GovernanceService', () => {
  let service: GovernanceService;

  beforeEach(() => {
    service = new GovernanceService();
  });

  describe('createProposal', () => {
    it('creates a new proposal with correct defaults', async () => {
      const proposal = await service.createProposal({
        title: 'Test Proposal',
        description: 'Test description',
        type: 'security_rule',
        quorum: 10,
      });

      expect(proposal.id).toBeDefined();
      expect(proposal.title).toBe('Test Proposal');
      expect(proposal.status).toBe('active');
      expect(proposal.votesFor).toBe(0);
      expect(proposal.votesAgainst).toBe(0);
      expect(proposal.createdAt).toBeInstanceOf(Date);
    });

    it('generates unique proposal IDs', async () => {
      const proposal1 = await service.createProposal({
        title: 'Proposal 1',
        description: 'Desc 1',
        type: 'security_rule',
        quorum: 10,
      });
      const proposal2 = await service.createProposal({
        title: 'Proposal 2',
        description: 'Desc 2',
        type: 'security_rule',
        quorum: 10,
      });

      expect(proposal1.id).not.toBe(proposal2.id);
    });
  });

  describe('vote', () => {
    it('allows voting on active proposals', async () => {
      const proposal = await service.createProposal({
        title: 'Vote Test',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
      });

      const result = await service.vote(proposal.id, {
        proposalId: proposal.id,
        voter: 'voter1',
        support: true,
        weight: 5,
      });

      expect(result).toBe(true);
      const updated = await service.getProposal(proposal.id);
      expect(updated!.votesFor).toBe(5);
      expect(updated!.votesAgainst).toBe(0);
    });

    it('prevents duplicate votes from same voter', async () => {
      const proposal = await service.createProposal({
        title: 'Duplicate Vote Test',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
      });

      await service.vote(proposal.id, {
        proposalId: proposal.id,
        voter: 'voter1',
        support: true,
        weight: 5,
      });

      const result = await service.vote(proposal.id, {
        proposalId: proposal.id,
        voter: 'voter1',
        support: false,
        weight: 3,
      });

      expect(result).toBe(false);
    });

    it('rejects votes on non-existent proposals', async () => {
      const result = await service.vote('non-existent', {
        proposalId: 'non-existent',
        voter: 'voter1',
        support: true,
        weight: 5,
      });

      expect(result).toBe(false);
    });

    it('updates proposal status when quorum is reached', async () => {
      const proposal = await service.createProposal({
        title: 'Quorum Test',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
      });

      await service.vote(proposal.id, {
        proposalId: proposal.id,
        voter: 'voter1',
        support: true,
        weight: 10,
      });

      const updated = await service.getProposal(proposal.id);
      expect(updated!.status).toBe('passed');
    });
  });

  describe('getProposal', () => {
    it('returns proposal by id', async () => {
      const created = await service.createProposal({
        title: 'Get Test',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
      });

      const retrieved = await service.getProposal(created.id);
      expect(retrieved).toEqual(created);
    });

    it('returns null for non-existent proposal', async () => {
      const result = await service.getProposal('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getActiveProposals', () => {
    it('returns all active proposals', async () => {
      await service.createProposal({
        title: 'Proposal 1',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
      });
      await service.createProposal({
        title: 'Proposal 2',
        description: 'Test',
        type: 'parameter_update',
        quorum: 5,
      });

      const proposals = await service.getActiveProposals();
      expect(proposals.length).toBeGreaterThanOrEqual(2);
      expect(proposals.every(p => p.status === 'active')).toBe(true);
    });
  });
});
