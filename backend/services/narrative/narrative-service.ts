import { lunarCrushClient, LunarCrushCoin } from './lunarcrush-client';
import { NarrativeCluster, NarrativeSignal, NarrativeToken, NARRATIVE_CLUSTERS } from './narrative.types';
import { isNarrativeFeatureAvailable } from '../../config';

export class NarrativeService {
  private cache: Map<string, { data: NarrativeCluster[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  isAvailable(): boolean {
    return isNarrativeFeatureAvailable();
  }

  async getClusters(): Promise<NarrativeCluster[]> {
    if (!this.isAvailable()) return [];

    const cached = this.cache.get('clusters');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const coins = await lunarCrushClient.getTopCoins(100);
    const clusters = this.buildClustersFromCoins(coins);
    
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
      .map(c => this.generateSignal(c));
  }

  private buildClustersFromCoins(coins: LunarCrushCoin[]): NarrativeCluster[] {
    return NARRATIVE_CLUSTERS.map(cluster => {
      const matchedCoins = coins.filter(coin => 
        cluster.keywords.some(kw => 
          coin.name.toLowerCase().includes(kw) || 
          coin.symbol.toLowerCase().includes(kw) ||
          coin.categories?.some(cat => cat.toLowerCase().includes(kw))
        )
      );

      const tokens: NarrativeToken[] = matchedCoins.slice(0, 5).map(coin => ({
        address: coin.symbol,
        symbol: coin.symbol,
        name: coin.name,
        mentions: coin.social_volume || 0,
        sentiment: coin.social_score || 0,
        priceChange24h: coin.percent_change_24h || 0,
        socialScore: coin.galaxy_score || 0,
      }));

      const totalMentions = tokens.reduce((sum, t) => sum + t.mentions, 0);
      const avgSentiment = tokens.length > 0 
        ? tokens.reduce((sum, t) => sum + t.sentiment, 0) / tokens.length 
        : 0;

      return {
        id: cluster.id,
        name: cluster.name,
        keywords: cluster.keywords,
        tokens,
        mentionCount: totalMentions,
        growthRate: this.calculateGrowthRate(matchedCoins),
        sentiment: avgSentiment,
        heatScore: this.calculateHeatScore(totalMentions, avgSentiment, matchedCoins),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  private calculateGrowthRate(coins: LunarCrushCoin[]): number {
    if (coins.length === 0) return 0;
    return coins.reduce((sum, c) => sum + (c.percent_change_24h || 0), 0) / coins.length;
  }

  private calculateHeatScore(mentions: number, sentiment: number, coins: LunarCrushCoin[]): number {
    const volumeScore = Math.min(mentions / 1000, 50);
    const sentimentScore = sentiment / 2;
    const priceScore = coins.length > 0
      ? Math.min(Math.abs(this.calculateGrowthRate(coins)), 30)
      : 0;
    return Math.round(volumeScore + sentimentScore + priceScore);
  }

  private generateSignal(cluster: NarrativeCluster): NarrativeSignal {
    const signalType = cluster.growthRate > 20 ? 'HEATING_UP' : 'COOLING_DOWN';
    return {
      clusterId: cluster.id,
      clusterName: cluster.name,
      signalType,
      strength: Math.min(Math.abs(cluster.growthRate), 100),
      topTokens: cluster.tokens.slice(0, 3).map(t => t.symbol),
      message: `${cluster.name} sector is ${signalType === 'HEATING_UP' ? 'gaining' : 'losing'} momentum`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const narrativeService = new NarrativeService();

