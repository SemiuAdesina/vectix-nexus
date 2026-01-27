import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('dexscreener-client', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('fetchSolanaTrending', () => {
    it('fetches trending tokens', async () => {
      const { fetchSolanaTrending } = await import('./dexscreener-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          pairs: [
            {
              chainId: 'solana',
              baseToken: { address: 'token1', name: 'Token1', symbol: 'TKN1' },
              quoteToken: { symbol: 'SOL' },
              priceUsd: '1.5',
              priceChange: { h24: 10 },
              volume: { h24: 100000 },
              liquidity: { usd: 50000 },
              fdv: 1000000,
            },
          ],
        }),
      } as Response);

      const tokens = await fetchSolanaTrending();
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[0].address).toBe('token1');
    });

    it('returns empty array on error', async () => {
      const { fetchSolanaTrending } = await import('./dexscreener-client');
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const tokens = await fetchSolanaTrending();
      expect(tokens).toEqual([]);
    });
  });

  describe('fetchTokenByAddress', () => {
    it('fetches token by address', async () => {
      const { fetchTokenByAddress } = await import('./dexscreener-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          pairs: [
            {
              baseToken: { address: 'token1', name: 'Token1', symbol: 'TKN1' },
              quoteToken: { symbol: 'SOL' },
              priceUsd: '1.5',
              priceChange: { h24: 10 },
              volume: { h24: 100000 },
              liquidity: { usd: 50000 },
              fdv: 1000000,
            },
          ],
        }),
      } as Response);

      const token = await fetchTokenByAddress('token1');
      expect(token).toBeTruthy();
      expect(token?.address).toBe('token1');
    });

    it('returns null when token not found', async () => {
      const { fetchTokenByAddress } = await import('./dexscreener-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const token = await fetchTokenByAddress('invalid');
      expect(token).toBeNull();
    });
  });

  describe('calculateTokenAge', () => {
    it('calculates token age in hours', async () => {
      const { calculateTokenAge } = await import('./dexscreener-client');
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const age = calculateTokenAge(oneDayAgo);
      expect(age).toBe(24);
    });
  });
});
