import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as rugcheckClient from './rugcheck-client';
import * as dexscreenerClient from './dexscreener-client';
import * as trustScore from './trust-score';
import * as securityScanningService from '../../../onchain/services/security-scanning';

vi.mock('./rugcheck-client', () => ({
  fetchRugCheckData: vi.fn(),
}));

vi.mock('./dexscreener-client', () => ({
  fetchTokenByAddress: vi.fn(),
}));

vi.mock('./trust-score', () => ({
  calculateTrustScore: vi.fn(),
}));

vi.mock('../../../onchain/services/security-scanning', () => ({
  securityScanningService: {
    scanToken: vi.fn(),
  },
}));

describe('token-security', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('analyzeToken', () => {
    it('analyzes token with RugCheck data', async () => {
      const { analyzeToken } = await import('./token-security');
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
      vi.mocked(trustScore.calculateTrustScore).mockReturnValue({
        score: 80,
        grade: 'B',
        risks: [],
        passed: [],
      } as any);
      vi.mocked(securityScanningService.securityScanningService.scanToken).mockResolvedValue({} as any);

      const result = await analyzeToken('token123');
      expect(result).toBeTruthy();
      expect(result?.report.tokenAddress).toBe('token123');
      expect(result?.trustScore.score).toBe(80);
    });

    it('creates heuristic report when RugCheck fails', async () => {
      const { analyzeToken } = await import('./token-security');
      vi.mocked(rugcheckClient.fetchRugCheckData).mockResolvedValue(null);
      vi.mocked(dexscreenerClient.fetchTokenByAddress).mockResolvedValue({
        liquidityUsd: 50000,
      } as any);
      vi.mocked(trustScore.calculateTrustScore).mockReturnValue({
        score: 60,
        grade: 'C',
        risks: [],
        passed: [],
      } as any);
      vi.mocked(securityScanningService.securityScanningService.scanToken).mockResolvedValue({} as any);

      const result = await analyzeToken('token123');
      expect(result).toBeTruthy();
      expect(result?.report.tokenAddress).toBe('token123');
    });
  });
});
