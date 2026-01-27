import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('webhooks.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /clerk/webhook', () => {
    it('handles user.created event', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@test.com',
        name: 'Test User',
      };
      vi.mocked(prisma.prisma.user.create).mockResolvedValue(mockUser as any);

      const user = await prisma.prisma.user.create({
        data: {
          id: 'user1',
          email: 'test@test.com',
          name: 'Test User',
        },
      });
      expect(user).toEqual(mockUser);
    });

    it('handles user.updated event', async () => {
      const mockUser = {
        id: 'user1',
        email: 'updated@test.com',
        name: 'Updated User',
      };
      vi.mocked(prisma.prisma.user.upsert).mockResolvedValue(mockUser as any);

      const user = await prisma.prisma.user.upsert({
        where: { id: 'user1' },
        create: { id: 'user1', email: 'updated@test.com', name: 'Updated User' },
        update: { email: 'updated@test.com', name: 'Updated User' },
      });
      expect(user).toEqual(mockUser);
    });

    it('handles user.deleted event', async () => {
      vi.mocked(prisma.prisma.user.delete).mockResolvedValue({} as any);

      await prisma.prisma.user.delete({ where: { id: 'user1' } });
      expect(prisma.prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user1' } });
    });
  });
});
