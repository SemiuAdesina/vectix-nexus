import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('goplus-client', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('fetchGoPlusData', () => {
    it('fetches GoPlus token data', async () => {
      const { fetchGoPlusData } = await import('./goplus-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 1,
          message: 'OK',
          result: {
            token123: {
              is_honeypot: '0',
              is_mintable: '1',
              is_freezable: '0',
              is_blacklisted: '0',
              buy_tax: '5',
              sell_tax: '5',
              holder_count: '100',
              top10_holder_balance: '50',
              liquidity: '1000000',
            },
          },
        }),
      } as Response);

      const data = await fetchGoPlusData('token123');
      expect(data).toBeTruthy();
      expect(data?.is_honeypot).toBe('0');
    });

    it('returns null on API error', async () => {
      const { fetchGoPlusData } = await import('./goplus-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const data = await fetchGoPlusData('token123');
      expect(data).toBeNull();
    });

    it('returns null on invalid response', async () => {
      const { fetchGoPlusData } = await import('./goplus-client');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 0,
          message: 'Error',
        }),
      } as Response);

      const data = await fetchGoPlusData('token123');
      expect(data).toBeNull();
    });
  });

  describe('parseGoPlusData', () => {
    it('parses GoPlus data correctly', async () => {
      const { parseGoPlusData } = await import('./goplus-client');
      const mockData = {
        is_honeypot: '0',
        is_mintable: '1',
        transfer_pausable: '0',
        is_blacklisted: '0',
        buy_tax: '0.05',
        sell_tax: '0.05',
        holder_count: '100',
        holders: [],
        lp_holders: [],
        can_take_back_ownership: '0',
        hidden_owner: '0',
        owner_change_balance: '0',
        is_proxy: '0',
        creator_address: '',
        creator_percent: '0',
        total_supply: '1000000',
      } as any;

      const parsed = parseGoPlusData(mockData);
      expect(parsed.isHoneypot).toBe(false);
      expect(parsed.isMintable).toBe(true);
      expect(parsed.buyTax).toBe(5);
    });
  });
});
