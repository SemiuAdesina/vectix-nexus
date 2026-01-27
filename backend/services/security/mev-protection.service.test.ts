import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as mevService from './mev-protection.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    agent: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('mev-protection.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createProtectedTransaction', () => {
    it('creates protected transaction when MEV protection enabled', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        mevProtectionEnabled: true,
      } as any);

      const result = await mevService.createProtectedTransaction('agent1', 'tx123', false);
      expect(result.protected).toBe(true);
      expect(result.method).toBe('jito');
    });

    it('returns unprotected when MEV protection disabled', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        mevProtectionEnabled: false,
      } as any);

      const result = await mevService.createProtectedTransaction('agent1', 'tx123', false);
      expect(result.protected).toBe(false);
    });

    it('uses turbo mode when requested', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        mevProtectionEnabled: false,
      } as any);

      const result = await mevService.createProtectedTransaction('agent1', 'tx123', true);
      expect(result.protected).toBe(true);
      expect(result.method).toBe('jito');
      expect(result.estimatedSavings).toBe(50000);
    });
  });

  describe('toggleMevProtection', () => {
    it('toggles MEV protection', async () => {
      vi.mocked(prisma.prisma.agent.update).mockResolvedValue({} as any);

      const result = await mevService.toggleMevProtection('agent1', true);
      expect(result).toBe(true);
      expect(prisma.prisma.agent.update).toHaveBeenCalledWith({
        where: { id: 'agent1' },
        data: { mevProtectionEnabled: true },
      });
    });
  });

  describe('calculateTurboFee', () => {
    it('calculates turbo fees', () => {
      const fees = mevService.calculateTurboFee();
      expect(fees).toEqual({
        userFee: 0.002,
        validatorTip: 0.001,
        profit: 0.001,
      });
    });
  });
});
