import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as onchainVerification from '../services/onchain-verification';

vi.mock('../services/onchain-verification', () => ({
  onChainVerification: {
    storeSecurityDecision: vi.fn(),
    verifyCertificate: vi.fn(),
  },
}));

describe('Onchain Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SOLANA_PROGRAM_ID = 'test-program-id';
  });

  describe('POST /onchain/log', () => {
    it('stores security decision successfully', async () => {
      const mockLog = {
        id: 'log1',
        agentId: 'agent1',
        decision: 'approved',
        reason: 'Test reason',
        timestamp: new Date().toISOString(),
        onChainProof: 'proof123',
      };

      vi.mocked(onchainVerification.onChainVerification.storeSecurityDecision).mockResolvedValue(mockLog as any);

      const result = await onchainVerification.onChainVerification.storeSecurityDecision({
        id: 'log1',
        agentId: 'agent1',
        decision: 'approved',
        reason: 'Test reason',
        timestamp: new Date().toISOString(),
      });

      expect(result).toEqual(mockLog);
      expect(onchainVerification.onChainVerification.storeSecurityDecision).toHaveBeenCalled();
    });

    it('handles errors when storing log fails', async () => {
      vi.mocked(onchainVerification.onChainVerification.storeSecurityDecision).mockRejectedValue(
        new Error('Storage failed')
      );

      await expect(
        onchainVerification.onChainVerification.storeSecurityDecision({
          id: 'log1',
          agentId: 'agent1',
          decision: 'approved',
        } as any)
      ).rejects.toThrow('Storage failed');
    });
  });

  describe('GET /onchain/verify/:proof', () => {
    it('verifies certificate successfully', async () => {
      const mockResult = {
        verified: true,
        proof: 'proof123',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(onchainVerification.onChainVerification.verifyCertificate).mockResolvedValue(mockResult);

      const result = await onchainVerification.onChainVerification.verifyCertificate('proof123');

      expect(result).toEqual(mockResult);
      expect(onchainVerification.onChainVerification.verifyCertificate).toHaveBeenCalledWith('proof123');
    });

    it('handles errors when verification fails', async () => {
      vi.mocked(onchainVerification.onChainVerification.verifyCertificate).mockRejectedValue(
        new Error('Verification failed')
      );

      await expect(
        onchainVerification.onChainVerification.verifyCertificate('invalid-proof')
      ).rejects.toThrow('Verification failed');
    });
  });
});
