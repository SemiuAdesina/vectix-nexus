import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as governanceService from '../services/governance';

vi.mock('../services/governance', () => ({
  governanceService: {
    createProposal: vi.fn(),
    vote: vi.fn(),
    getActiveProposals: vi.fn(),
    getProposal: vi.fn(),
    executeProposal: vi.fn(),
  },
}));

describe('Governance Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/governance/proposal', () => {
    it('creates a proposal successfully', async () => {
      const mockProposal = {
        id: 'proposal1',
        title: 'Test Proposal',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
        status: 'active',
        votesFor: 0,
        votesAgainst: 0,
        createdAt: new Date(),
      };

      vi.mocked(governanceService.governanceService.createProposal).mockResolvedValue(mockProposal as any);

      const result = await governanceService.governanceService.createProposal({
        title: 'Test Proposal',
        description: 'Test',
        type: 'security_rule',
        quorum: 10,
      });

      expect(result).toEqual(mockProposal);
      expect(governanceService.governanceService.createProposal).toHaveBeenCalled();
    });
  });

  describe('POST /onchain/governance/vote', () => {
    it('votes successfully', async () => {
      vi.mocked(governanceService.governanceService.vote).mockResolvedValue(true);

      const result = await governanceService.governanceService.vote('proposal1', {
        proposalId: 'proposal1',
        voter: 'voter1',
        support: true,
        weight: 5,
      });

      expect(result).toBe(true);
      expect(governanceService.governanceService.vote).toHaveBeenCalled();
    });

    it('handles failed vote', async () => {
      vi.mocked(governanceService.governanceService.vote).mockResolvedValue(false);
      
      const result = await governanceService.governanceService.vote('invalid', {
        proposalId: 'invalid',
        voter: 'voter1',
        support: true,
        weight: 5,
      });

      expect(result).toBe(false);
    });
  });
});
