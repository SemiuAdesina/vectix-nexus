import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeToken, shouldAutoReject } from './token-security';
import * as rugcheckClient from './rugcheck-client';
import * as dexscreenerClient from './dexscreener-client';

vi.mock('./rugcheck-client', () => ({
  fetchRugCheckData: vi.fn(),
}));

vi.mock('./dexscreener-client', () => ({
  fetchTokenByAddress: vi.fn(),
}));

describe('token-security', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('analyzeToken', () => {
    it('analyzes token with RugCheck data', async () => {
      vi.mocked(rugcheckClient.fetchRugCheckData).mockResolvedValue({
        score: 85,
        isMintable: false,
        isFreezable: false,
        top10HoldersPercent: 20,
        lpLockedPercent: 90,
        risks: [],
      } as any);
      vi.mocked(dexscreenerClient.fetchTokenByAddress).mockResolvedValue({
        liquidityUsd: 100000,
      } as any);

      const result = await analyzeToken('token123');
      expect(result).toBeTruthy();
      expect(result?.report.tokenAddress).toBe('token123');
      expect(result?.report).toHaveProperty('isMintable');
      expect(result?.trustScore).toBeDefined();
    });

    it('creates heuristic report when RugCheck fails', async () => {
      vi.mocked(rugcheckClient.fetchRugCheckData).mockResolvedValue(null);
      vi.mocked(dexscreenerClient.fetchTokenByAddress).mockResolvedValue({
        liquidityUsd: 50000,
      } as any);

      const result = await analyzeToken('token123');
      expect(result).toBeTruthy();
      expect(result?.report.tokenAddress).toBe('token123');
    });
  });

  describe('shouldAutoReject', () => {
    it('rejects low trust score when safety mode enabled', () => {
      const result = shouldAutoReject(50, true);
      expect(result.reject).toBe(true);
    });

    it('accepts when safety mode disabled', () => {
      const result = shouldAutoReject(50, false);
      expect(result.reject).toBe(false);
    });
  });
});
