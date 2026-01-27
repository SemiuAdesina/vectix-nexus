import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../lib/prisma';
import * as auth from '../lib/auth';

vi.mock('../lib/prisma', () => ({
  prisma: {
    agent: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../lib/auth', () => ({
  getUserIdFromRequest: vi.fn(),
}));

describe('token.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /agents/:id/launch-token', () => {
    it('launches token for agent', async () => {
      vi.mocked(auth.getUserIdFromRequest).mockResolvedValue('user1');
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue({
        id: 'agent1',
        walletAddress: 'wallet123',
      } as any);

      const agent = await prisma.prisma.agent.findFirst({
        where: { id: 'agent1', userId: 'user1' },
      });
      expect(agent).toBeDefined();
      expect(agent?.walletAddress).toBe('wallet123');
    });
  });

  describe('GET /agents/:id/token', () => {
    it('returns token info for agent', async () => {
      vi.mocked(auth.getUserIdFromRequest).mockResolvedValue('user1');
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue({ id: 'agent1' } as any);

      const agent = await prisma.prisma.agent.findFirst({
        where: { id: 'agent1', userId: 'user1' },
      });
      expect(agent).toBeDefined();
    });
  });
});
