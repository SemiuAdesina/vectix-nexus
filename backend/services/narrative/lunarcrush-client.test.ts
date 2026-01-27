import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

vi.mock('../../config', () => ({
  getNarrativeApiConfig: vi.fn(() => ({
    lunarcrush: {
      apiKey: 'test-key',
      baseUrl: 'https://api.lunarcrush.com',
    },
  })),
}));

describe('lunarcrush-client', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('LunarCrushClient', () => {
    it('checks if configured', async () => {
      const { LunarCrushClient } = await import('./lunarcrush-client');
      const client = new LunarCrushClient();
      expect(client.isConfigured()).toBe(true);
    });

    it('gets top coins', async () => {
      const { LunarCrushClient } = await import('./lunarcrush-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              symbol: 'BTC',
              name: 'Bitcoin',
              price: 50000,
              percent_change_24h: 5,
              galaxy_score: 80,
              alt_rank: 1,
              social_volume: 1000000,
              social_score: 90,
              social_contributors: 5000,
              social_dominance: 30,
              market_cap: 1000000000,
              categories: ['crypto'],
            },
          ],
        }),
      } as Response);

      const client = new LunarCrushClient();
      const coins = await client.getTopCoins(10);
      expect(coins.length).toBeGreaterThan(0);
      expect(coins[0].symbol).toBe('BTC');
    });

    it('returns empty array when API key not configured', async () => {
      vi.mocked(await import('../../config')).getNarrativeApiConfig = vi.fn(() => ({
        lunarcrush: { apiKey: undefined, baseUrl: 'https://api.lunarcrush.com' },
      }));

      const { LunarCrushClient } = await import('./lunarcrush-client');
      const client = new LunarCrushClient();
      const coins = await client.getTopCoins();
      expect(coins).toEqual([]);
    });
  });
});
