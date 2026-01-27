import { lunarCrushClient } from './lunarcrush-client';
import { NarrativeCluster, NarrativeSignal } from './narrative.types';
import { isNarrativeFeatureAvailable, isDemoModeEnabled } from '../../config';
import { buildClustersFromCoins } from './cluster-builder';
import { generateDemoClusters } from './demo-generator';
import { generateSignal } from './signal-generator';

export class NarrativeService {
  private cache: Map<string, { data: NarrativeCluster[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  isAvailable(): boolean {
    return isNarrativeFeatureAvailable() || isDemoModeEnabled();
  }

  async getClusters(): Promise<NarrativeCluster[]> {
    if (!this.isAvailable()) return [];

    const cached = this.cache.get('clusters');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    if (isDemoModeEnabled() && !isNarrativeFeatureAvailable()) {
      const clusters = generateDemoClusters();
      this.cache.set('clusters', { data: clusters, timestamp: Date.now() });
      return clusters;
    }

    const coins = await lunarCrushClient.getTopCoins(100);
    const clusters = buildClustersFromCoins(coins);
    
    this.cache.set('clusters', { data: clusters, timestamp: Date.now() });
    return clusters;
  }

  async getHottestClusters(limit = 5): Promise<NarrativeCluster[]> {
    const clusters = await this.getClusters();
    return clusters.sort((a, b) => b.heatScore - a.heatScore).slice(0, limit);
  }

  async getSignals(): Promise<NarrativeSignal[]> {
    if (!this.isAvailable()) return [];
    
    const clusters = await this.getClusters();
    return clusters
      .filter(c => c.growthRate > 20 || c.growthRate < -20)
      .map(c => generateSignal(c));
  }
}

export const narrativeService = new NarrativeService();

