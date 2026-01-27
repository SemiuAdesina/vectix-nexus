import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as wallet from './wallet';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  API_ENDPOINTS: {
    agents: {
      balance: (id: string) => `/api/agents/${id}/balance`,
    },
    auth: {
      wallet: '/api/user/wallet',
    },
  },
}));

describe('wallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgentBalance', () => {
    it('fetches agent balance', async () => {
      const mockBalance = { sol: 10, lamports: 10_000_000_000 };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ balance: mockBalance }),
      } as Response);

      const balance = await wallet.getAgentBalance('agent1');
      expect(balance).toEqual(mockBalance);
    });

    it('throws error on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(wallet.getAgentBalance('agent1')).rejects.toThrow();
    });
  });

  describe('withdrawAgentFunds', () => {
    it('withdraws agent funds', async () => {
      const mockResult = {
        success: true,
        signature: 'sig123',
        amountSol: 10,
      };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await wallet.withdrawAgentFunds('agent1', 'wallet123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserWallet', () => {
    it('updates user wallet', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await wallet.updateUserWallet('wallet123');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

});
