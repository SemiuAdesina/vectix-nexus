import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as affiliateService from './affiliate.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    referralPayout: {
      create: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe('affiliate.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('generateReferralCode', () => {
    it('returns existing referral code if user already has one', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({
        referralCode: 'EXISTING123',
      } as any);

      const code = await affiliateService.generateReferralCode('user1');
      expect(code).toBe('EXISTING123');
      expect(prisma.prisma.user.update).not.toHaveBeenCalled();
    });

    it('generates new referral code if user does not have one', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.prisma.user.update).mockResolvedValue({} as any);

      const code = await affiliateService.generateReferralCode('user1');
      expect(code).toMatch(/^[A-F0-9]{8}$/);
      expect(prisma.prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('applyReferralCode', () => {
    it('applies referral code successfully', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({ id: 'referrer1' } as any);
      vi.mocked(prisma.prisma.user.update).mockResolvedValue({} as any);

      const result = await affiliateService.applyReferralCode('user1', 'REF123');
      expect(result).toBe(true);
      expect(prisma.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { referredById: 'referrer1' },
      });
    });

    it('returns false if referral code does not exist', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue(null);

      const result = await affiliateService.applyReferralCode('user1', 'INVALID');
      expect(result).toBe(false);
    });

    it('returns false if user tries to refer themselves', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({ id: 'user1' } as any);

      const result = await affiliateService.applyReferralCode('user1', 'REF123');
      expect(result).toBe(false);
    });
  });

  describe('getAffiliateStats', () => {
    it('returns affiliate stats', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({
        referralCode: 'REF123',
        totalReferralEarnings: 100,
        referrals: [{ id: 'ref1' }, { id: 'ref2' }],
      } as any);
      vi.mocked(prisma.prisma.referralPayout.aggregate).mockResolvedValue({
        _sum: { amount: 50 },
      } as any);

      const stats = await affiliateService.getAffiliateStats('user1');
      expect(stats).toEqual({
        referralCode: 'REF123',
        totalReferrals: 2,
        totalEarnings: 100,
        pendingPayouts: 50,
      });
    });

    it('throws error if user not found', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue(null);

      await expect(affiliateService.getAffiliateStats('user1')).rejects.toThrow('User not found');
    });
  });

  describe('recordReferralEarning', () => {
    it('records referral earning', async () => {
      vi.mocked(prisma.prisma.referralPayout.create).mockResolvedValue({} as any);
      vi.mocked(prisma.prisma.user.update).mockResolvedValue({} as any);

      await affiliateService.recordReferralEarning('referrer1', 'user1', 100, 'tx123');
      
      expect(prisma.prisma.referralPayout.create).toHaveBeenCalledWith({
        data: {
          userId: 'referrer1',
          sourceUserId: 'user1',
          amount: 20,
          sourceTxHash: 'tx123',
          status: 'pending',
        },
      });
      expect(prisma.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'referrer1' },
        data: { totalReferralEarnings: { increment: 20 } },
      });
    });
  });
});
