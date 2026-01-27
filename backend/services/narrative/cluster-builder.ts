import { LunarCrushCoin } from './lunarcrush-client';
import { NarrativeCluster, NarrativeToken, NARRATIVE_CLUSTERS } from './narrative.types';

export function buildClustersFromCoins(coins: LunarCrushCoin[]): NarrativeCluster[] {
  return NARRATIVE_CLUSTERS.map(cluster => {
    const matchedCoins = coins.filter(coin => 
      cluster.keywords.some(kw => 
        coin.name.toLowerCase().includes(kw) || 
        coin.symbol.toLowerCase().includes(kw) ||
        coin.categories?.some((cat: string) => cat.toLowerCase().includes(kw))
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
      growthRate: calculateGrowthRate(matchedCoins),
      sentiment: avgSentiment,
      heatScore: calculateHeatScore(totalMentions, avgSentiment, matchedCoins),
      updatedAt: new Date().toISOString(),
    };
  });
}

function calculateGrowthRate(coins: LunarCrushCoin[]): number {
  if (coins.length === 0) return 0;
  return coins.reduce((sum, c) => sum + (c.percent_change_24h || 0), 0) / coins.length;
}

function calculateHeatScore(mentions: number, sentiment: number, coins: LunarCrushCoin[]): number {
  const volumeScore = Math.min(mentions / 1000, 50);
  const sentimentScore = sentiment / 2;
  const priceScore = coins.length > 0
    ? Math.min(Math.abs(calculateGrowthRate(coins)), 30)
    : 0;
  return Math.round(volumeScore + sentimentScore + priceScore);
}
