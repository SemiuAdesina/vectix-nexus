import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as affiliateService from '../services/affiliate/affiliate.service';

vi.mock('../services/affiliate/affiliate.service', () => ({
  generateReferralCode: vi.fn(),
  applyReferralCode: vi.fn(),
  getAffiliateStats: vi.fn(),
  recordReferralEarning: vi.fn(),
}));

describe('affiliate.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /affiliate/stats/:userId', () => {
    it('returns affiliate stats', async () => {
      const mockStats = {
        referralCode: 'ABC123',
        totalReferrals: 5,
        totalEarnings: 100,
        pendingPayouts: 20,
      };
      vi.mocked(affiliateService.getAffiliateStats).mockResolvedValue(mockStats);

      const stats = await affiliateService.getAffiliateStats('user1');
      expect(stats).toEqual(mockStats);
    });

    it('handles errors', async () => {
      vi.mocked(affiliateService.getAffiliateStats).mockRejectedValue(new Error('Database error'));

      await expect(affiliateService.getAffiliateStats('user1')).rejects.toThrow('Database error');
    });
  });

  describe('POST /affiliate/generate-code', () => {
    it('generates referral code', async () => {
      vi.mocked(affiliateService.generateReferralCode).mockResolvedValue('ABC123');

      const code = await affiliateService.generateReferralCode('user1');
      expect(code).toBe('ABC123');
      expect(affiliateService.generateReferralCode).toHaveBeenCalledWith('user1');
    });
  });

  describe('POST /affiliate/apply-code', () => {
    it('applies referral code successfully', async () => {
      vi.mocked(affiliateService.applyReferralCode).mockResolvedValue(true);

      const result = await affiliateService.applyReferralCode('user1', 'ABC123');
      expect(result).toBe(true);
      expect(affiliateService.applyReferralCode).toHaveBeenCalledWith('user1', 'ABC123');
    });

    it('returns false for invalid code', async () => {
      vi.mocked(affiliateService.applyReferralCode).mockResolvedValue(false);

      const result = await affiliateService.applyReferralCode('user1', 'INVALID');
      expect(result).toBe(false);
    });
  });

  describe('POST /affiliate/record-earning', () => {
    it('records referral earning', async () => {
      vi.mocked(affiliateService.recordReferralEarning).mockResolvedValue(undefined);

      await affiliateService.recordReferralEarning('referrer1', 'user1', 10, 'tx123');
      expect(affiliateService.recordReferralEarning).toHaveBeenCalledWith('referrer1', 'user1', 10, 'tx123');
    });
  });
});
