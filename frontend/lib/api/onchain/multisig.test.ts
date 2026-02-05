import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as multisig from './multisig';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('multisig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMultiSig', () => {
    it('creates multisig', async () => {
      const mockResponse = { success: true, multisigId: 'multisig1' };
      (global.fetch as Mock).mockResolvedValue({
        text: async () => JSON.stringify(mockResponse),
        json: async () => mockResponse,
      } as Response);

      const result = await multisig.createMultiSig({
        agentId: 'agent1',
        threshold: 2,
        signers: ['signer1', 'signer2', 'signer3'],
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createMultiSigProposal', () => {
    it('creates multisig proposal', async () => {
      const mockResponse = {
        success: true,
        proposal: { id: 'proposal1', multisigId: 'multisig1', action: 'transfer' },
      };
      (global.fetch as Mock).mockResolvedValue({
        text: async () => JSON.stringify(mockResponse),
        json: async () => mockResponse,
      } as Response);

      const result = await multisig.createMultiSigProposal('multisig1', {
        type: 'withdrawal',
        tokenAddress: 'target1',
        amount: 100,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
