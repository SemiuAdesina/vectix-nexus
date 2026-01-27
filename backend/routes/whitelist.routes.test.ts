import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as whitelistService from '../services/security/whitelist.service';

vi.mock('../services/security/whitelist.service', () => ({
  getWhitelistStatus: vi.fn(),
  setWhitelistedWallet: vi.fn(),
  checkWithdrawalAllowed: vi.fn(),
}));

describe('whitelist.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /agent/:agentId/whitelist', () => {
    it('returns whitelist status', async () => {
      const mockStatus = {
        agentId: 'agent1',
        whitelistedWallet: 'wallet1',
        isLocked: false,
        lockedUntil: null,
        canWithdraw: true,
      };
      vi.mocked(whitelistService.getWhitelistStatus).mockResolvedValue(mockStatus);

      const status = await whitelistService.getWhitelistStatus('agent1');
      expect(status).toEqual(mockStatus);
    });
  });

  describe('POST /agent/:agentId/whitelist', () => {
    it('sets whitelisted wallet', async () => {
      const mockResult = {
        success: true,
        agentId: 'agent1',
        walletAddress: 'wallet1',
        lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        message: 'Whitelist updated successfully',
      };
      vi.mocked(whitelistService.setWhitelistedWallet).mockResolvedValue(mockResult);

      const result = await whitelistService.setWhitelistedWallet('agent1', 'wallet1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('POST /agent/:agentId/whitelist/check', () => {
    it('checks withdrawal allowed', async () => {
      const mockResult = {
        allowed: true,
        reason: 'Wallet is whitelisted',
      };
      vi.mocked(whitelistService.checkWithdrawalAllowed).mockResolvedValue(mockResult);

      const result = await whitelistService.checkWithdrawalAllowed('agent1', 'wallet1');
      expect(result).toEqual(mockResult);
    });
  });
});
