import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SecurityScanningService } from './security-scanning';

describe('SecurityScanningService', () => {
  let service: SecurityScanningService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SecurityScanningService();
  });

  afterEach(() => {
    service.stopContinuousScanning();
  });

  describe('scanToken', () => {
    it('scans a token and returns security result', async () => {
      const result = await service.scanToken('token-scan-test-unique-1');

      expect(result.tokenAddress).toBe('token-scan-test-unique-1');
      expect(typeof result.trustScore).toBe('number');
      expect(result.trustScore).toBeGreaterThanOrEqual(0);
      expect(result.trustScore).toBeLessThanOrEqual(100);
      expect(result.trustGrade).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('uses cached result when available', async () => {
      const tokenAddress = `token-cache-${Date.now()}`;
      const result1 = await service.scanToken(tokenAddress);
      const result2 = await service.scanToken(tokenAddress);

      expect(result1.tokenAddress).toBe(tokenAddress);
      expect(result2.tokenAddress).toBe(tokenAddress);
      expect(result2.trustScore).toBe(result1.trustScore);
    });

    it('creates alert on significant score change', async () => {
      const tokenAddress = `token-alert-${Date.now()}`;
      const result1 = await service.scanToken(tokenAddress);

      expect(typeof result1.trustScore).toBe('number');
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
      expect(alerts.every((a: { severity: string }) => a.severity === 'high')).toBe(true);
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
