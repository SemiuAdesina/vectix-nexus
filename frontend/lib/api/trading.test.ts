import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as trading from './trading';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  API_ENDPOINTS: {
    publicApi: {
      trade: (id: string) => `/api/agents/${id}/trade`,
      trending: '/api/market/trending',
    },
  },
}));

describe('trading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeTrade', () => {
    it('executes trade successfully', async () => {
      const mockResult = {
        success: true,
        mode: 'paper',
        action: 'buy',
        token: 'SOL',
        amount: 10,
        message: 'Trade executed',
      };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await trading.executeTrade('agent1', {
        action: 'buy',
        token: 'SOL',
        amount: 10,
      });
      expect(result).toEqual(mockResult);
    });

    it('throws error on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Trade failed' }),
      } as Response);

      await expect(
        trading.executeTrade('agent1', { action: 'buy', token: 'SOL', amount: 10 })
      ).rejects.toThrow();
    });
  });

  describe('getTrendingTokens', () => {
    it('fetches trending tokens', async () => {
      const mockData = {
        delayed: false,
        dataTimestamp: new Date().toISOString(),
        message: 'Real-time',
        tokens: [{ symbol: 'SOL', name: 'Solana', price: 100, change24h: 5 }],
      };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await trading.getTrendingTokens('api-key-123');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to fetch' }),
      } as Response);

      await expect(trading.getTrendingTokens('api-key-123')).rejects.toThrow();
    });
  });
});
