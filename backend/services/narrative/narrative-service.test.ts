import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NarrativeService } from './narrative-service';
import * as config from '../../config';

vi.mock('../../config', () => ({
  isNarrativeFeatureAvailable: vi.fn(),
}));

vi.mock('./lunarcrush-client', () => ({
  lunarCrushClient: {
    getTopCoins: vi.fn().mockResolvedValue([]),
  },
}));

describe('NarrativeService', () => {
  let service: NarrativeService;

  beforeEach(() => {
    service = new NarrativeService();
    vi.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('returns true when feature is available', () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(true);
      expect(service.isAvailable()).toBe(true);
    });

    it('returns false when feature is not available', () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('getClusters', () => {
    it('returns empty array when not available', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      const clusters = await service.getClusters();
      expect(clusters).toEqual([]);
    });

    it('returns clusters when available', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(true);
      const clusters = await service.getClusters();
      expect(Array.isArray(clusters)).toBe(true);
    });
  });

  describe('getHottestClusters', () => {
    it('returns sorted clusters by heat score', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(true);
      const clusters = await service.getHottestClusters(5);
      expect(Array.isArray(clusters)).toBe(true);
      if (clusters.length >= 2) {
        expect(clusters[0].heatScore).toBeGreaterThanOrEqual(clusters[1].heatScore);
      }
    });
  });

  describe('getSignals', () => {
    it('returns empty array when not available', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      const signals = await service.getSignals();
      expect(signals).toEqual([]);
    });

    it('returns signals array when available', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(true);
      const signals = await service.getSignals();
      expect(Array.isArray(signals)).toBe(true);
    });
  });
});
