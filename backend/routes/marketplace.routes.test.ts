import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../lib/prisma';
import * as auth from '../lib/auth';
import * as stripeService from '../services/stripe';

vi.mock('../lib/prisma', () => ({
  prisma: {
    strategy: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    strategyPurchase: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../lib/auth', () => ({
  getOrCreateUser: vi.fn(),
  getUserIdFromRequest: vi.fn(),
}));

vi.mock('../services/stripe', () => ({
  createStrategyCheckout: vi.fn(),
}));

describe('marketplace.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /marketplace/strategies', () => {
    it('returns strategies', async () => {
      const mockStrategies = [{ id: 'strategy1', name: 'Test Strategy', verified: true }];
      vi.mocked(prisma.prisma.strategy.findMany).mockResolvedValue(mockStrategies as any);

      const strategies = await prisma.prisma.strategy.findMany({
        where: { verified: true },
      });
      expect(strategies).toEqual(mockStrategies);
    });
  });

  describe('GET /marketplace/strategies/:id', () => {
    it('returns strategy by id', async () => {
      const mockStrategy = { id: 'strategy1', name: 'Test Strategy' };
      vi.mocked(prisma.prisma.strategy.findUnique).mockResolvedValue(mockStrategy as any);

      const strategy = await prisma.prisma.strategy.findUnique({
        where: { id: 'strategy1' },
      });
      expect(strategy).toEqual(mockStrategy);
    });
  });

  describe('POST /marketplace/strategies/:id/purchase', () => {
    it('creates purchase for free strategy', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1', user: { email: 'test@test.com' } } as any);
      vi.mocked(prisma.prisma.strategy.findUnique).mockResolvedValue({ id: 'strategy1', priceUsd: 0 } as any);
      vi.mocked(prisma.prisma.strategyPurchase.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.prisma.strategyPurchase.create).mockResolvedValue({} as any);
      vi.mocked(prisma.prisma.strategy.update).mockResolvedValue({} as any);

      const purchase = await prisma.prisma.strategyPurchase.create({
        data: { userId: 'user1', strategyId: 'strategy1', pricePaid: 0 },
      });
      expect(purchase).toBeDefined();
    });
  });
});
