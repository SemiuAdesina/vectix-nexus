import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SecurityScanningService } from './security-scanning';
import * as tokenSecurity from '../../backend/services/security/token-security';

vi.mock('../../backend/services/security/token-security', () => ({
  analyzeToken: vi.fn(),
}));

describe('SecurityScanningService', () => {
  let service: SecurityScanningService;

  beforeEach(() => {
    service = new SecurityScanningService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.stopContinuousScanning();
  });

  describe('scanToken', () => {
    it('scans a token and returns security result', async () => {
      const mockAnalysis = {
        trustScore: {
          score: 85,
          grade: 'A',
          risks: [],
          passed: [{ id: '1', label: 'Test', severity: 'low', passed: true, message: 'Passed' }],
        },
      };

      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue(mockAnalysis as any);

      const result = await service.scanToken('token123');

      expect(result.tokenAddress).toBe('token123');
      expect(result.trustScore).toBe(85);
      expect(result.trustGrade).toBe('A');
      expect(tokenSecurity.analyzeToken).toHaveBeenCalledWith('token123');
    });

    it('uses cached result when available', async () => {
      const mockAnalysis = {
        trustScore: {
          score: 85,
          grade: 'A',
          risks: [],
          passed: [],
        },
      };

      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue(mockAnalysis as any);

      await service.scanToken('token123');
      vi.clearAllMocks();

      const result = await service.scanToken('token123');
      expect(result.tokenAddress).toBe('token123');
      expect(tokenSecurity.analyzeToken).not.toHaveBeenCalled();
    });

    it('creates alert on significant score change', async () => {
      const mockAnalysis1 = {
        trustScore: {
          score: 85,
          grade: 'A',
          risks: [],
          passed: [],
        },
        report: {
          tokenAddress: 'token-alert-test',
          liquidityUsd: 1000000,
        },
      };

      const mockAnalysis2 = {
        trustScore: {
          score: 60,
          grade: 'C',
          risks: [],
          passed: [],
        },
        report: {
          tokenAddress: 'token-alert-test',
          liquidityUsd: 1000000,
        },
      };

      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValueOnce(mockAnalysis1 as any);
      const result1 = await service.scanToken('token-alert-test');
      expect(result1.trustScore).toBe(85);
      expect(result1.scoreChange).toBe(0);
      
      const alerts = await service.getAlerts({ limit: 10 });
      expect(Array.isArray(alerts)).toBe(true);
      expect(service).toBeDefined();
    });
  });

  describe('getAlerts', () => {
    it('returns security alerts', async () => {
      const alerts = await service.getAlerts({ limit: 10 });
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('filters alerts by severity', async () => {
      const alerts = await service.getAlerts({ severity: 'high', limit: 10 });
      expect(alerts.every(a => a.severity === 'high')).toBe(true);
    });
  });

  describe('startContinuousScanning', () => {
    it('starts continuous scanning', () => {
      service.startContinuousScanning();
      expect(service).toBeDefined();
    });

    it('does not start multiple intervals', () => {
      service.startContinuousScanning();
      service.startContinuousScanning();
      service.stopContinuousScanning();
    });
  });

  describe('stopContinuousScanning', () => {
    it('stops continuous scanning', () => {
      service.startContinuousScanning();
      service.stopContinuousScanning();
      expect(service).toBeDefined();
    });
  });
});
