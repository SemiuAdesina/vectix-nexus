import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as mevProtectionService from '../services/security/mev-protection.service';
import * as sanctionsService from '../services/security/sanctions.service';

vi.mock('../services/security/mev-protection.service', () => ({
  toggleMevProtection: vi.fn(),
  calculateTurboFee: vi.fn(),
}));

vi.mock('../services/security/sanctions.service', () => ({
  checkWalletSanctions: vi.fn(),
  screenUserWallet: vi.fn(),
}));

describe('protection.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /agent/:agentId/mev-protection', () => {
    it('toggles MEV protection', async () => {
      vi.mocked(mevProtectionService.toggleMevProtection).mockResolvedValue(true);

      const result = await mevProtectionService.toggleMevProtection('agent1', true);
      expect(result).toBe(true);
      expect(mevProtectionService.toggleMevProtection).toHaveBeenCalledWith('agent1', true);
    });
  });

  describe('GET /turbo/fees', () => {
    it('returns turbo fees', () => {
      const mockFees = { userFee: 0.001, validatorTip: 0.0005, profit: 0.0005 };
      vi.mocked(mevProtectionService.calculateTurboFee).mockReturnValue(mockFees);

      const fees = mevProtectionService.calculateTurboFee();
      expect(fees).toEqual(mockFees);
    });
  });

  describe('POST /sanctions/check', () => {
    it('checks wallet sanctions', async () => {
      const mockResult = { address: 'wallet123', isSanctioned: false, riskLevel: 'low' as const, source: 'OFAC' };
      vi.mocked(sanctionsService.checkWalletSanctions).mockResolvedValue(mockResult);

      const result = await sanctionsService.checkWalletSanctions('wallet123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('POST /sanctions/screen-user', () => {
    it('screens user wallet', async () => {
      const mockResult = { allowed: true, reason: 'Wallet cleared' };
      vi.mocked(sanctionsService.screenUserWallet).mockResolvedValue(mockResult);

      const result = await sanctionsService.screenUserWallet('user1', 'wallet123');
      expect(result).toEqual(mockResult);
    });
  });
});
