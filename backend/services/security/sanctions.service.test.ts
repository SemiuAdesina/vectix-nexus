import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as sanctionsService from './sanctions.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe('sanctions.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('checkWalletSanctions', () => {
    it('detects sanctioned wallet', async () => {
      const result = await sanctionsService.checkWalletSanctions('0x8589427373D6D84E98730D7795D8f6f8731FDA16');
      expect(result.isSanctioned).toBe(true);
      expect(result.riskLevel).toBe('severe');
    });

    it('returns clean for non-sanctioned wallet', async () => {
      const result = await sanctionsService.checkWalletSanctions('0x1234567890123456789012345678901234567890');
      expect(result.isSanctioned).toBe(false);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('screenUserWallet', () => {
    it('blocks sanctioned wallet', async () => {
      vi.mocked(prisma.prisma.user.update).mockResolvedValue({} as any);

      const result = await sanctionsService.screenUserWallet('user1', '0x8589427373D6D84E98730D7795D8f6f8731FDA16');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('flagged');
      expect(prisma.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { sanctionStatus: 'blocked' },
      });
    });

    it('allows clean wallet', async () => {
      vi.mocked(prisma.prisma.user.update).mockResolvedValue({} as any);

      const result = await sanctionsService.screenUserWallet('user1', '0x1234567890123456789012345678901234567890');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Wallet cleared');
      expect(prisma.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { sanctionStatus: 'clean' },
      });
    });
  });
});
