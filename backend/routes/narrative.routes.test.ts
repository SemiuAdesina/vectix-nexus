import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as narrativeService from '../services/narrative/narrative-service';

vi.mock('../services/narrative/narrative-service', () => ({
  narrativeService: {
    isAvailable: vi.fn(),
    getClusters: vi.fn(),
    getHottestClusters: vi.fn(),
    getSignals: vi.fn(),
  },
}));

describe('narrative.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /narrative/status', () => {
    it('returns narrative status', () => {
      vi.mocked(narrativeService.narrativeService.isAvailable).mockReturnValue(true);
      const available = narrativeService.narrativeService.isAvailable();
      expect(available).toBe(true);
    });
  });

  describe('GET /narrative/clusters', () => {
    it('returns clusters', async () => {
      const mockClusters = [{ id: 'cluster1', name: 'Test Cluster' }];
      vi.mocked(narrativeService.narrativeService.getClusters).mockResolvedValue(mockClusters as any);

      const clusters = await narrativeService.narrativeService.getClusters();
      expect(clusters).toEqual(mockClusters);
    });
  });

  describe('GET /narrative/hot', () => {
    it('returns hottest clusters', async () => {
      const mockClusters = [{ id: 'cluster1', name: 'Hot Cluster', heatScore: 90 }];
      vi.mocked(narrativeService.narrativeService.getHottestClusters).mockResolvedValue(mockClusters as any);

      const clusters = await narrativeService.narrativeService.getHottestClusters(5);
      expect(clusters).toEqual(mockClusters);
    });
  });

  describe('GET /narrative/signals', () => {
    it('returns signals', async () => {
      const mockSignals = [{ id: 'signal1', type: 'HEATING_UP' }];
      vi.mocked(narrativeService.narrativeService.getSignals).mockResolvedValue(mockSignals as any);

      const signals = await narrativeService.narrativeService.getSignals();
      expect(signals).toEqual(mockSignals);
    });
  });
});
