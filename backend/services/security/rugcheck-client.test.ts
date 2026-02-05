import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('rugcheck-client', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('fetchRugCheckData', () => {
    const validSolanaAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    it('fetches RugCheck data for valid Solana address', async () => {
      const { fetchRugCheckData } = await import('./rugcheck-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          mint: validSolanaAddress,
          score: 85,
          risks: [
            { name: 'Mint Authority', value: 'Renounced', level: 'good', description: 'Good' },
          ],
          tokenMeta: { name: 'Test Token', symbol: 'TEST' },
          topHolders: [{ pct: 20 }, { pct: 15 }],
          markets: [{ lp: { lpLockedPct: 80 } }],
          freezeAuthority: null,
          mintAuthority: null,
        }),
      } as Response);

      const result = await fetchRugCheckData(validSolanaAddress);
      expect(result).toBeTruthy();
      expect(result?.score).toBe(85);
      expect(result?.isMintable).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(validSolanaAddress)),
        expect.any(Object)
      );
    });

    it('returns null for invalid address without calling fetch', async () => {
      const { fetchRugCheckData } = await import('./rugcheck-client');
      const result = await fetchRugCheckData('x/../evil');
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns null on API error', async () => {
      const { fetchRugCheckData } = await import('./rugcheck-client');
      vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);
      const result = await fetchRugCheckData(validSolanaAddress);
      expect(result).toBeNull();
    });
  });
});
