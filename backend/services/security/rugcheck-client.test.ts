import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('rugcheck-client', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('fetchRugCheckData', () => {
    it('fetches RugCheck data', async () => {
      const { fetchRugCheckData } = await import('./rugcheck-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          mint: 'token123',
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

      const result = await fetchRugCheckData('token123');
      expect(result).toBeTruthy();
      expect(result?.score).toBe(85);
      expect(result?.isMintable).toBe(false);
    });

    it('returns null on API error', async () => {
      const { fetchRugCheckData } = await import('./rugcheck-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const result = await fetchRugCheckData('token123');
      expect(result).toBeNull();
    });
  });
});
