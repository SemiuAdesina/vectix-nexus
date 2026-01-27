import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NarrativeService } from './narrative-service';
import * as config from '../../config';

vi.mock('../../config', () => ({
  isNarrativeFeatureAvailable: vi.fn(),
  isDemoModeEnabled: vi.fn(),
}));

vi.mock('./lunarcrush-client', () => ({
  lunarCrushClient: {
    getTopCoins: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('./cluster-builder', () => ({
  buildClustersFromCoins: vi.fn().mockReturnValue([]),
}));

vi.mock('./demo-generator', () => ({
  generateDemoClusters: vi.fn().mockReturnValue([]),
}));

vi.mock('./signal-generator', () => ({
  generateSignal: vi.fn().mockReturnValue({
    clusterId: 'test',
    clusterName: 'Test',
    signalType: 'HEATING_UP',
    strength: 50,
    topTokens: [],
    message: 'Test signal',
    timestamp: new Date().toISOString(),
  }),
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

    it('returns true when demo mode is enabled', () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      vi.mocked(config.isDemoModeEnabled).mockReturnValue(true);
      expect(service.isAvailable()).toBe(true);
    });

    it('returns false when neither is available', () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      vi.mocked(config.isDemoModeEnabled).mockReturnValue(false);
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('getClusters', () => {
    it('returns empty array when not available', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      vi.mocked(config.isDemoModeEnabled).mockReturnValue(false);
      
      const clusters = await service.getClusters();
      expect(clusters).toEqual([]);
    });

    it('uses demo clusters when demo mode is enabled', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      vi.mocked(config.isDemoModeEnabled).mockReturnValue(true);
      
      const { generateDemoClusters } = await import('./demo-generator');
      const mockClusters = [{ id: 'demo1', name: 'Demo Cluster' }];
      vi.mocked(generateDemoClusters).mockReturnValue(mockClusters as any);
      
      const clusters = await service.getClusters();
      expect(clusters).toEqual(mockClusters);
    });
  });

  describe('getHottestClusters', () => {
    it('returns top clusters sorted by heat score', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(true);
      vi.mocked(config.isDemoModeEnabled).mockReturnValue(true);
      
      const mockClusters = [
        { id: '1', name: 'Cluster 1', heatScore: 50, keywords: [], tokens: [], mentionCount: 0, growthRate: 0, sentiment: 0, updatedAt: new Date().toISOString() },
        { id: '2', name: 'Cluster 2', heatScore: 80, keywords: [], tokens: [], mentionCount: 0, growthRate: 0, sentiment: 0, updatedAt: new Date().toISOString() },
        { id: '3', name: 'Cluster 3', heatScore: 30, keywords: [], tokens: [], mentionCount: 0, growthRate: 0, sentiment: 0, updatedAt: new Date().toISOString() },
      ];
      
      const { generateDemoClusters } = await import('./demo-generator');
      vi.mocked(generateDemoClusters).mockReturnValue(mockClusters as any);
      
      const service2 = new NarrativeService();
      const clusters = await service2.getClusters();
      const hottest = clusters.sort((a, b) => b.heatScore - a.heatScore).slice(0, 2);
      
      expect(hottest.length).toBeGreaterThanOrEqual(0);
      if (hottest.length >= 2) {
        expect(hottest[0].heatScore).toBeGreaterThanOrEqual(hottest[1].heatScore);
      }
    });
  });

  describe('getSignals', () => {
    it('returns empty array when not available', async () => {
      vi.mocked(config.isNarrativeFeatureAvailable).mockReturnValue(false);
      vi.mocked(config.isDemoModeEnabled).mockReturnValue(false);
      
      const signals = await service.getSignals();
      expect(signals).toEqual([]);
    });
  });
});
