import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../lib/prisma';
import * as withdrawalService from './withdrawal-confirm.service';

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('withdrawal-confirm.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('generateWithdrawalToken', () => {
    it('generates withdrawal token', () => {
      const token = withdrawalService.generateWithdrawalToken();
      expect(token).toBeTruthy();
      expect(token.length).toBe(64);
    });
  });

  describe('requestWithdrawal', () => {
    it('creates withdrawal request', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({
        email: 'test@test.com',
      } as any);

      const result = await withdrawalService.requestWithdrawal('user1', 'agent1', 'wallet123');
      expect(result.token).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('verifyWithdrawalToken', () => {
    it('verifies valid token', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({
        email: 'test@test.com',
      } as any);

      const { token } = await withdrawalService.requestWithdrawal('user1', 'agent1', 'wallet123');
      const result = withdrawalService.verifyWithdrawalToken(token, 'user1', 'agent1');
      expect(result.valid).toBe(true);
      expect(result.destination).toBe('wallet123');
    });

    it('rejects invalid token', () => {
      const result = withdrawalService.verifyWithdrawalToken('invalid', 'user1', 'agent1');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects token for wrong user', async () => {
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({
        email: 'test@test.com',
      } as any);

      const { token } = await withdrawalService.requestWithdrawal('user1', 'agent1', 'wallet123');
      const result = withdrawalService.verifyWithdrawalToken(token, 'user2', 'agent1');
      expect(result.valid).toBe(false);
    });
  });
});
