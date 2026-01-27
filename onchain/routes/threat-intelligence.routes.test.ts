import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as threatIntelligenceService from '../services/threat-intelligence';

vi.mock('../services/threat-intelligence', () => ({
  threatIntelligenceService: {
    detectAnomaly: vi.fn(),
    getThreatFeed: vi.fn(),
    reportThreat: vi.fn(),
  },
}));

describe('Threat Intelligence Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/threats/detect', () => {
    it('detects anomaly successfully', async () => {
      const mockResult = {
        isAnomaly: true,
        confidence: 75,
        reason: 'Unusual volume spike',
      };

      const metrics = {
        volume: 2000000,
        priceChange: 10,
        tradeCount: 50,
        tokenAddress: 'token123',
      };

      vi.mocked(threatIntelligenceService.threatIntelligenceService.detectAnomaly).mockResolvedValue(mockResult);

      const result = await threatIntelligenceService.threatIntelligenceService.detectAnomaly(metrics);

      expect(result).toEqual(mockResult);
      expect(threatIntelligenceService.threatIntelligenceService.detectAnomaly).toHaveBeenCalledWith(metrics);
    });

    it('handles errors when detection fails', async () => {
      vi.mocked(threatIntelligenceService.threatIntelligenceService.detectAnomaly).mockRejectedValue(
        new Error('Detection failed')
      );

      await expect(
        threatIntelligenceService.threatIntelligenceService.detectAnomaly({})
      ).rejects.toThrow('Detection failed');
    });
  });

  describe('GET /onchain/threats/feed', () => {
    it('returns threat feed with default limit', async () => {
      const mockFeed = [
        {
          id: 'threat1',
          type: 'anomaly',
          severity: 'high',
          description: 'Suspicious activity detected',
          timestamp: new Date(),
        },
      ];

      vi.mocked(threatIntelligenceService.threatIntelligenceService.getThreatFeed).mockResolvedValue(mockFeed as any);

      const result = await threatIntelligenceService.threatIntelligenceService.getThreatFeed(50);

      expect(result).toEqual(mockFeed);
      expect(threatIntelligenceService.threatIntelligenceService.getThreatFeed).toHaveBeenCalledWith(50);
    });

    it('returns threat feed with custom limit', async () => {
      const mockFeed = [
        {
          id: 'threat1',
          type: 'anomaly',
          severity: 'high',
          description: 'Suspicious activity detected',
          timestamp: new Date(),
        },
      ];

      vi.mocked(threatIntelligenceService.threatIntelligenceService.getThreatFeed).mockResolvedValue(mockFeed as any);

      const result = await threatIntelligenceService.threatIntelligenceService.getThreatFeed(20);

      expect(result).toEqual(mockFeed);
      expect(threatIntelligenceService.threatIntelligenceService.getThreatFeed).toHaveBeenCalledWith(20);
    });

    it('handles errors when getting feed fails', async () => {
      vi.mocked(threatIntelligenceService.threatIntelligenceService.getThreatFeed).mockRejectedValue(
        new Error('Failed to get feed')
      );

      await expect(
        threatIntelligenceService.threatIntelligenceService.getThreatFeed(50)
      ).rejects.toThrow('Failed to get feed');
    });
  });

  describe('POST /onchain/threats/report', () => {
    it('reports threat successfully', async () => {
      const mockReport = {
        id: 'report1',
        type: 'suspicious_transaction',
        severity: 'medium',
        description: 'Reported suspicious activity',
        timestamp: new Date(),
      };

      const reportData = {
        reporter: 'user1',
        severity: 'medium' as const,
        description: 'Reported suspicious activity',
      };

      vi.mocked(threatIntelligenceService.threatIntelligenceService.reportThreat).mockResolvedValue(mockReport as any);

      const result = await threatIntelligenceService.threatIntelligenceService.reportThreat(reportData);

      expect(result).toEqual(mockReport);
      expect(threatIntelligenceService.threatIntelligenceService.reportThreat).toHaveBeenCalledWith(reportData);
    });

    it('handles errors when reporting threat fails', async () => {
      vi.mocked(threatIntelligenceService.threatIntelligenceService.reportThreat).mockRejectedValue(
        new Error('Report failed')
      );

      await expect(
        threatIntelligenceService.threatIntelligenceService.reportThreat({} as any)
      ).rejects.toThrow('Report failed');
    });
  });
});
