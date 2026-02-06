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
    const validSolanaAddress = 'So11111111111111111111111111111111111111112';

    it('fetches token by valid Solana address', async () => {
      const { fetchTokenByAddress } = await import('./dexscreener-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          pairs: [
            {
              baseToken: { address: validSolanaAddress, name: 'Token1', symbol: 'TKN1' },
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

      const token = await fetchTokenByAddress(validSolanaAddress);
      expect(token).toBeTruthy();
      expect(token?.address).toBe(validSolanaAddress);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(validSolanaAddress)),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('returns null for invalid address without calling fetch', async () => {
      const { fetchTokenByAddress } = await import('./dexscreener-client');
      const token = await fetchTokenByAddress('https://evil.com/path');
      expect(token).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns null for too-short address', async () => {
      const { fetchTokenByAddress } = await import('./dexscreener-client');
      const token = await fetchTokenByAddress('short');
      expect(token).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns null when API returns not ok', async () => {
      const { fetchTokenByAddress } = await import('./dexscreener-client');
      vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);
      const token = await fetchTokenByAddress(validSolanaAddress);
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
