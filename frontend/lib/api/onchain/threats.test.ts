import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as threats from './threats';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('threats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectThreat', () => {
    it('detects threat from metrics', async () => {
      const mockResponse = {
        success: true,
        isAnomaly: false,
        confidence: 30,
        reason: 'No threat detected',
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await threats.detectThreat({
        volume: 1000000,
        priceChange: 5,
        tradeCount: 50,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getThreatFeed', () => {
    it('fetches threat feed', async () => {
      const mockResponse = {
        success: true,
        threats: [{ id: 'threat1', type: 'anomaly', severity: 'high' }],
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await threats.getThreatFeed();
      expect(result).toEqual(mockResponse);
    });

    it('fetches threat feed with limit', async () => {
      const mockResponse = {
        success: true,
        threats: [{ id: 'threat1', type: 'anomaly' }],
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await threats.getThreatFeed(10);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reportThreat', () => {
    it('reports threat', async () => {
      const mockResponse = {
        success: true,
        report: { id: 'report1', type: 'suspicious_activity', status: 'pending' },
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await threats.reportThreat({
        reporter: 'user1',
        description: 'Suspicious trading pattern',
        severity: 'high',
        tokenAddress: 'token1',
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
