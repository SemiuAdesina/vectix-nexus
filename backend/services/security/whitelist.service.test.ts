import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as whitelistService from './whitelist.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    agent: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('whitelist.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getWhitelistStatus', () => {
    it('returns whitelist status', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        id: 'agent1',
        whitelistedWallet: 'wallet123',
        whitelistLockedUntil: null,
      } as any);

      const status = await whitelistService.getWhitelistStatus('agent1');
      expect(status).toBeTruthy();
      expect(status?.agentId).toBe('agent1');
      expect(status?.canWithdraw).toBe(true);
    });

    it('returns null for non-existent agent', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue(null);

      const status = await whitelistService.getWhitelistStatus('agent1');
      expect(status).toBeNull();
    });

    it('detects locked status', async () => {
      const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        id: 'agent1',
        whitelistedWallet: 'wallet123',
        whitelistLockedUntil: lockedUntil,
      } as any);

      const status = await whitelistService.getWhitelistStatus('agent1');
      expect(status?.isLocked).toBe(true);
      expect(status?.canWithdraw).toBe(false);
    });
  });

  describe('setWhitelistedWallet', () => {
    it('sets whitelisted wallet', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        whitelistedWallet: null,
        whitelistLockedUntil: null,
      } as any);
      vi.mocked(prisma.prisma.agent.update).mockResolvedValue({} as any);

      const result = await whitelistService.setWhitelistedWallet('agent1', 'wallet123');
      expect(result.success).toBe(true);
      expect(result.lockedUntil).toBeDefined();
    });

    it('throws error if agent not found', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue(null);

      await expect(whitelistService.setWhitelistedWallet('agent1', 'wallet123')).rejects.toThrow('Agent not found');
    });

    it('throws error if wallet is locked', async () => {
      const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        whitelistedWallet: 'wallet123',
        whitelistLockedUntil: lockedUntil,
      } as any);

      await expect(whitelistService.setWhitelistedWallet('agent1', 'wallet456')).rejects.toThrow('locked until');
    });
  });

  describe('checkWithdrawalAllowed', () => {
    it('allows withdrawal to whitelisted wallet', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        id: 'agent1',
        whitelistedWallet: 'wallet123',
        whitelistLockedUntil: null,
      } as any);

      const result = await whitelistService.checkWithdrawalAllowed('agent1', 'wallet123');
      expect(result.allowed).toBe(true);
    });

    it('rejects withdrawal to non-whitelisted wallet', async () => {
      vi.mocked(prisma.prisma.agent.findUnique).mockResolvedValue({
        id: 'agent1',
        whitelistedWallet: 'wallet123',
        whitelistLockedUntil: null,
      } as any);

      const result = await whitelistService.checkWithdrawalAllowed('agent1', 'wallet456');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('does not match');
    });
  });
});
