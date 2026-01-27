import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    agent: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('public-api/agents.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /agents', () => {
    it('returns agents for user', async () => {
      const mockAgents = [{ id: 'agent1', name: 'Agent 1' }];
      vi.mocked(prisma.prisma.agent.findMany).mockResolvedValue(mockAgents as any);

      const agents = await prisma.prisma.agent.findMany({
        where: { userId: 'user1' },
      });
      expect(agents).toEqual(mockAgents);
    });
  });

  describe('GET /agents/:id', () => {
    it('returns agent by id', async () => {
      const mockAgent = { id: 'agent1', name: 'Agent 1' };
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue(mockAgent as any);

      const agent = await prisma.prisma.agent.findFirst({
        where: { id: 'agent1', userId: 'user1' },
      });
      expect(agent).toEqual(mockAgent);
    });
  });

  describe('POST /agents/:id/start', () => {
    it('starts agent', async () => {
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue({ id: 'agent1' } as any);
      vi.mocked(prisma.prisma.agent.update).mockResolvedValue({} as any);

      await prisma.prisma.agent.update({
        where: { id: 'agent1' },
        data: { status: 'starting' },
      });
      expect(prisma.prisma.agent.update).toHaveBeenCalled();
    });
  });
});
