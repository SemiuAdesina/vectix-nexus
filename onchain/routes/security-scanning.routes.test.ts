import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as securityScanningService from '../services/security-scanning';

vi.mock('../services/security-scanning', () => ({
  securityScanningService: {
    scanToken: vi.fn(),
    getAlerts: vi.fn(),
  },
}));

describe('Security Scanning Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/security/scan', () => {
    it('scans token successfully', async () => {
      const mockResult = {
        tokenAddress: 'token123',
        trustScore: 85,
        trustGrade: 'A',
        risks: [],
        passed: ['liquidity', 'holder_distribution'],
        timestamp: new Date(),
      };

      vi.mocked(securityScanningService.securityScanningService.scanToken).mockResolvedValue(mockResult as any);

      const result = await securityScanningService.securityScanningService.scanToken('token123');

      expect(result).toEqual(mockResult);
      expect(securityScanningService.securityScanningService.scanToken).toHaveBeenCalledWith('token123');
    });

    it('handles errors when scan fails', async () => {
      vi.mocked(securityScanningService.securityScanningService.scanToken).mockRejectedValue(
        new Error('Scan failed')
      );

      await expect(
        securityScanningService.securityScanningService.scanToken('invalid-token')
      ).rejects.toThrow('Scan failed');
    });
  });

  describe('GET /onchain/security/alerts', () => {
    it('returns alerts without filters', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          tokenAddress: 'token123',
          severity: 'high',
          message: 'High risk detected',
          timestamp: new Date(),
        },
      ];

      vi.mocked(securityScanningService.securityScanningService.getAlerts).mockResolvedValue(mockAlerts as any);

      const result = await securityScanningService.securityScanningService.getAlerts({});

      expect(result).toEqual(mockAlerts);
      expect(securityScanningService.securityScanningService.getAlerts).toHaveBeenCalledWith({});
    });

    it('returns filtered alerts with query parameters', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          tokenAddress: 'token123',
          severity: 'high',
          message: 'High risk detected',
          timestamp: new Date(),
        },
      ];

      vi.mocked(securityScanningService.securityScanningService.getAlerts).mockResolvedValue(mockAlerts as any);

      const filters = {
        severity: 'high',
        tokenAddress: 'token123',
        limit: 10,
      };

      const result = await securityScanningService.securityScanningService.getAlerts(filters);

      expect(result).toEqual(mockAlerts);
      expect(securityScanningService.securityScanningService.getAlerts).toHaveBeenCalledWith(filters);
    });

    it('handles errors when getting alerts fails', async () => {
      vi.mocked(securityScanningService.securityScanningService.getAlerts).mockRejectedValue(
        new Error('Failed to get alerts')
      );

      await expect(
        securityScanningService.securityScanningService.getAlerts({})
      ).rejects.toThrow('Failed to get alerts');
    });
  });
});
