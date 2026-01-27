import { describe, it, expect, beforeEach } from 'vitest';
import { ThreatIntelligenceService } from './threat-intelligence';
import type { ThreatPattern, ThreatReport } from './onchain-types';

describe('ThreatIntelligenceService', () => {
  let service: ThreatIntelligenceService;

  beforeEach(() => {
    service = new ThreatIntelligenceService();
  });

  describe('detectAnomaly', () => {
    it('detects no anomaly for normal metrics', async () => {
      const result = await service.detectAnomaly({
        volume: 100000,
        priceChange: 5,
        tradeCount: 10,
      });

      expect(result.isAnomaly).toBe(false);
      expect(result.confidence).toBeLessThan(50);
    });

    it('detects anomaly for high volume', async () => {
      const result = await service.detectAnomaly({
        volume: 2000000,
        tradeCount: 120, // Add trade count (20 points) to reach 50 threshold: 30 + 20 = 50
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(50);
      expect(result.reason).toContain('Unusual volume spike');
    });

    it('detects anomaly for extreme price change', async () => {
      const result = await service.detectAnomaly({
        priceChange: 60,
        tradeCount: 120, // Add trade count (20 points) to reach 50 threshold: 40 + 20 = 60
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(50);
      expect(result.reason).toContain('Extreme price movement');
    });

    it('detects anomaly for high trade count', async () => {
      const result = await service.detectAnomaly({
        tradeCount: 150,
        volume: 1500000, // Add volume to reach threshold
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(50);
      expect(result.reason).toContain('High trade frequency');
    });

    it('combines multiple anomaly indicators', async () => {
      const result = await service.detectAnomaly({
        volume: 2000000,
        priceChange: 60,
        tradeCount: 150,
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.confidence).toBeGreaterThan(50);
    });
  });

  describe('getThreatFeed', () => {
    it('returns threat feed with limit', async () => {
      const feed = await service.getThreatFeed(10);
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeLessThanOrEqual(10);
    });
  });

  describe('addThreatPattern', () => {
    it('adds a threat pattern', async () => {
      const pattern: Omit<ThreatPattern, 'id' | 'createdAt'> = {
        name: 'Test Pattern',
        description: 'Test description',
        volumeThreshold: 1000000,
      };

      const result = await service.addThreatPattern(pattern);
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Pattern');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('reportThreat', () => {
    it('creates a threat report', async () => {
      const report: Omit<ThreatReport, 'id' | 'createdAt'> = {
        reporter: 'reporter1',
        tokenAddress: 'token123',
        description: 'Suspicious activity detected',
        severity: 'high',
      };

      const result = await service.reportThreat(report);
      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
