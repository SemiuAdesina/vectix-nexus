import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as marketplace from './marketplace';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
  API_ENDPOINTS: {
    marketplace: {
      strategies: '/api/marketplace/strategies',
      strategyDetail: (id: string) => `/api/marketplace/strategies/${id}`,
      purchased: '/api/marketplace/purchased',
      purchase: (id: string) => `/api/marketplace/strategies/${id}/purchase`,
    },
  },
}));

describe('marketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStrategies', () => {
    it('fetches strategies', async () => {
      const mockStrategies = [{ id: 'strategy1', name: 'Test Strategy' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ strategies: mockStrategies }),
      } as Response);

      const strategies = await marketplace.getStrategies();
      expect(strategies).toEqual(mockStrategies);
    });

    it('fetches strategies with filters', async () => {
      const mockStrategies = [{ id: 'strategy1', name: 'Test Strategy', category: 'defi' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ strategies: mockStrategies }),
      } as Response);

      const strategies = await marketplace.getStrategies({ category: 'defi', featured: true });
      expect(strategies).toEqual(mockStrategies);
    });
  });

  describe('getStrategy', () => {
    it('fetches single strategy', async () => {
      const mockStrategy = { id: 'strategy1', name: 'Test Strategy' };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ strategy: mockStrategy }),
      } as Response);

      const strategy = await marketplace.getStrategy('strategy1');
      expect(strategy).toEqual(mockStrategy);
    });
  });

  describe('getPurchasedStrategies', () => {
    it('fetches purchased strategies', async () => {
      const mockStrategies = [{ id: 'strategy1', name: 'Test Strategy' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ strategies: mockStrategies }),
      } as Response);

      const strategies = await marketplace.getPurchasedStrategies();
      expect(strategies).toEqual(mockStrategies);
    });
  });

  describe('purchaseStrategy', () => {
    it('purchases strategy', async () => {
      const mockResult = { success: true, alreadyOwned: false };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResult,
      } as Response);

      const result = await marketplace.purchaseStrategy('strategy1');
      expect(result).toEqual(mockResult);
    });
  });
});
