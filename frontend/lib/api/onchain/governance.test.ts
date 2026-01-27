import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as governance from './governance';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('governance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGovernanceProposal', () => {
    it('creates governance proposal', async () => {
      const mockResponse = {
        success: true,
        proposal: { id: 'proposal1', title: 'Test Proposal', status: 'pending' },
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await governance.createGovernanceProposal({
        title: 'Test Proposal',
        description: 'Test description',
        type: 'parameter_change',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('voteOnProposal', () => {
    it('votes on proposal', async () => {
      const mockResponse = { success: true };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await governance.voteOnProposal('proposal1', {
        voter: 'user1',
        vote: 'yes',
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Vote failed' }),
      } as Response);

      await expect(
        governance.voteOnProposal('proposal1', { voter: 'user1', vote: 'yes' })
      ).rejects.toThrow('Vote failed');
    });
  });

  describe('getGovernanceProposals', () => {
    it('fetches governance proposals', async () => {
      const mockResponse = {
        success: true,
        proposals: [{ id: 'proposal1', title: 'Test Proposal' }],
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await governance.getGovernanceProposals();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getGovernanceProposal', () => {
    it('fetches single proposal', async () => {
      const mockResponse = {
        success: true,
        proposal: { id: 'proposal1', title: 'Test Proposal' },
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await governance.getGovernanceProposal('proposal1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('executeGovernanceProposal', () => {
    it('executes governance proposal', async () => {
      const mockResponse = { success: true };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await governance.executeGovernanceProposal('proposal1');
      expect(result).toEqual(mockResponse);
    });
  });
});
