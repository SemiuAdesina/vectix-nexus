import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as security from './security';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
  API_ENDPOINTS: {
    security: {
      analyze: (address: string) => `/api/security/analyze/${address}`,
      checkTrade: '/api/security/check-trade',
      trendingSafe: '/api/public/security/trending',
      trending: '/api/public/security/trending',
    },
  },
}));

describe('security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeToken', () => {
    it('analyzes token security', async () => {
      const mockResponse = {
        success: true,
        report: { tokenAddress: 'token1', isHoneypot: false, liquidityUsd: 100000 },
        trustScore: { score: 85, grade: 'A', risks: [], passed: [] },
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await security.analyzeToken('token1');
      expect(result).toEqual({
        report: mockResponse.report,
        trustScore: mockResponse.trustScore,
      });
    });

    it('returns null on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: false }),
      } as Response);

      const result = await security.analyzeToken('token1');
      expect(result).toBeNull();
    });
  });

  describe('checkTradeSafety', () => {
    it('checks trade safety', async () => {
      const mockResponse = {
        approved: true,
        reason: 'Safe to trade',
        trustScore: 85,
        trustGrade: 'A',
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await security.checkTradeSafety('token1', true);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSafeTrending', () => {
    it('fetches safe trending tokens', async () => {
      const mockTokens = [{ address: 'token1', symbol: 'TKN', trustScore: 85 }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ tokens: mockTokens }),
      } as Response);

      const tokens = await security.getSafeTrending(70);
      expect(tokens).toEqual(mockTokens);
    });
  });

  describe('getAllTrending', () => {
    it('fetches all trending tokens', async () => {
      const mockTokens = [{ address: 'token1', symbol: 'TKN', trustScore: 75 }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ tokens: mockTokens }),
      } as Response);

      const tokens = await security.getAllTrending();
      expect(tokens).toEqual(mockTokens);
    });
  });
});
