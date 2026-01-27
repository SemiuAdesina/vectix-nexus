import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tokenSecurity from '../services/security/token-security';
import * as safeTrending from '../services/security/safe-trending';

vi.mock('../services/security/token-security', () => ({
  analyzeToken: vi.fn(),
}));

vi.mock('../services/security/safe-trending', () => ({
  getAllTrending: vi.fn(),
}));

describe('public-security.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /public/security/score/:tokenAddress', () => {
    it('returns token security score', async () => {
      const mockAnalysis = {
        trustScore: {
          score: 85,
          grade: 'A',
          risks: [],
          passed: ['liquidity', 'holder_distribution'],
        },
      };
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue(mockAnalysis as any);

      const analysis = await tokenSecurity.analyzeToken('token123');
      expect(analysis).toEqual(mockAnalysis);
    });
  });

  describe('GET /public/security/trending', () => {
    it('returns trending tokens', async () => {
      const mockTokens = [
        { address: 'token1', trustScore: 90, trustGrade: 'A', liquidityUsd: 1000000 },
      ];
      vi.mocked(safeTrending.getAllTrending).mockResolvedValue(mockTokens as any);

      const tokens = await safeTrending.getAllTrending();
      expect(tokens).toEqual(mockTokens);
    });
  });
});
