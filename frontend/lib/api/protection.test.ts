import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as protection from './protection';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  API_ENDPOINTS: {
    agents: {
      whitelist: (id: string) => `/api/agent/${id}/whitelist`,
      mevProtection: (id: string) => `/api/agent/${id}/mev-protection`,
    },
    affiliate: {
      stats: (id: string) => `/api/affiliate/stats/${id}`,
      generateCode: '/api/affiliate/generate-code',
      applyCode: '/api/affiliate/apply-code',
    },
    turbo: {
      fees: '/api/turbo/fees',
    },
    security: {
      sanctions: '/api/sanctions/check',
    },
  },
}));

describe('protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWhitelistStatus', () => {
    it('fetches whitelist status', async () => {
      const mockStatus = {
        success: true,
        agentId: 'agent1',
        whitelistedWallet: 'wallet123',
        isLocked: false,
        canWithdraw: true,
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockStatus,
      } as Response);

      const status = await protection.getWhitelistStatus('agent1');
      expect(status).toEqual(mockStatus);
    });

    it('returns null on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: false }),
      } as Response);

      const status = await protection.getWhitelistStatus('agent1');
      expect(status).toBeNull();
    });
  });

  describe('setWhitelistedWallet', () => {
    it('sets whitelisted wallet', async () => {
      const mockResponse = { success: true, lockedUntil: new Date().toISOString() };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await protection.setWhitelistedWallet('agent1', 'wallet123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAffiliateStats', () => {
    it('fetches affiliate stats', async () => {
      const mockStats = {
        success: true,
        referralCode: 'ABC123',
        totalReferrals: 5,
        totalEarnings: 100,
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockStats,
      } as Response);

      const stats = await protection.getAffiliateStats('user1');
      expect(stats).toEqual(mockStats);
    });
  });

  describe('generateReferralCode', () => {
    it('generates referral code', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: true, referralCode: 'ABC123' }),
      } as Response);

      const code = await protection.generateReferralCode('user1');
      expect(code).toBe('ABC123');
    });
  });

  describe('applyReferralCode', () => {
    it('applies referral code', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: true }),
      } as Response);

      const result = await protection.applyReferralCode('user1', 'ABC123');
      expect(result).toBe(true);
    });
  });

  describe('toggleMevProtection', () => {
    it('toggles MEV protection', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: true }),
      } as Response);

      const result = await protection.toggleMevProtection('agent1', true);
      expect(result).toBe(true);
    });
  });

  describe('getTurboFees', () => {
    it('fetches turbo fees', async () => {
      const mockFees = { userFee: 0.002, validatorTip: 0.001, profit: 0.001 };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockFees,
      } as Response);

      const fees = await protection.getTurboFees();
      expect(fees).toEqual(mockFees);
    });
  });

  describe('checkSanctions', () => {
    it('checks wallet sanctions', async () => {
      const mockResponse = { isSanctioned: false, riskLevel: 'low' };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await protection.checkSanctions('wallet123');
      expect(result).toEqual(mockResponse);
    });
  });
});
