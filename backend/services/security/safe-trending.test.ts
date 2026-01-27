import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dexscreenerClient from './dexscreener-client';
import * as tokenSecurity from './token-security';

vi.mock('./dexscreener-client', () => ({
  fetchSolanaTrending: vi.fn(),
}));

vi.mock('./token-security', () => ({
  analyzeToken: vi.fn(),
}));

describe('safe-trending', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getSafeTrending', () => {
    it('returns safe trending tokens', async () => {
      const { getSafeTrending } = await import('./safe-trending');
      vi.mocked(dexscreenerClient.fetchSolanaTrending).mockResolvedValue([
        {
          address: 'token1',
          liquidityUsd: 100000,
          priceChange24h: 10,
        } as any,
      ]);
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue({
        trustScore: { score: 80, grade: 'B' },
      } as any);

      const tokens = await getSafeTrending(70);
      expect(tokens.length).toBeGreaterThan(0);
    });

    it('filters by minimum trust score', async () => {
      const { getSafeTrending } = await import('./safe-trending');
      vi.mocked(dexscreenerClient.fetchSolanaTrending).mockResolvedValue([
        {
          address: 'token1',
          liquidityUsd: 100000,
          priceChange24h: 10,
        } as any,
      ]);
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue({
        trustScore: { score: 60, grade: 'C' },
      } as any);

      const tokens = await getSafeTrending(70);
      expect(tokens.length).toBe(0);
    });
  });

  describe('getAllTrending', () => {
    it('returns all trending tokens', async () => {
      const { getAllTrending } = await import('./safe-trending');
      vi.mocked(dexscreenerClient.fetchSolanaTrending).mockResolvedValue([
        {
          address: 'token1',
          liquidityUsd: 50000,
          priceChange24h: 5,
        } as any,
      ]);
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue({
        trustScore: { score: 75, grade: 'B' },
      } as any);

      const tokens = await getAllTrending();
      expect(tokens.length).toBeGreaterThan(0);
    });
  });

  describe('getTokenByAddress', () => {
    it('returns token by address', async () => {
      const { getTokenByAddress } = await import('./safe-trending');
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue({
        trustScore: { score: 80, grade: 'B' },
        report: { liquidityUsd: 100000 },
      } as any);

      const token = await getTokenByAddress('token123');
      expect(token).toBeTruthy();
      expect(token?.trustScore).toBe(80);
    });

    it('returns null when analysis fails', async () => {
      const { getTokenByAddress } = await import('./safe-trending');
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue(null);

      const token = await getTokenByAddress('token123');
      expect(token).toBeNull();
    });
  });
});
