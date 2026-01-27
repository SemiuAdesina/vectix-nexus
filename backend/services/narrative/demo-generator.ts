import { NarrativeCluster, NarrativeToken, NARRATIVE_CLUSTERS } from './narrative.types';

export function generateDemoClusters(): NarrativeCluster[] {
  const demoTokens: Record<string, Array<{ symbol: string; name: string }>> = {
    'ai-agents': [
      { symbol: 'FET', name: 'Fetch.ai' },
      { symbol: 'AGIX', name: 'SingularityNET' },
      { symbol: 'OCEAN', name: 'Ocean Protocol' },
      { symbol: 'RNDR', name: 'Render Token' },
      { symbol: 'AI', name: 'Sleepless AI' },
    ],
    'dog-coins': [
      { symbol: 'DOGE', name: 'Dogecoin' },
      { symbol: 'SHIB', name: 'Shiba Inu' },
      { symbol: 'WIF', name: 'dogwifhat' },
      { symbol: 'BONK', name: 'Bonk' },
      { symbol: 'FLOKI', name: 'FLOKI' },
    ],
    'cat-coins': [
      { symbol: 'MEW', name: 'Cat in a Dogs World' },
      { symbol: 'POPCAT', name: 'Popcat' },
      { symbol: 'MEOW', name: 'Meowcoin' },
    ],
    'politifi': [
      { symbol: 'TRUMP', name: 'Truth Social' },
      { symbol: 'BODEN', name: 'Jeo Boden' },
    ],
    'defi-yield': [
      { symbol: 'JUP', name: 'Jupiter' },
      { symbol: 'RAY', name: 'Raydium' },
      { symbol: 'ORCA', name: 'Orca' },
    ],
    'gaming': [
      { symbol: 'AXS', name: 'Axie Infinity' },
      { symbol: 'SAND', name: 'The Sandbox' },
      { symbol: 'MANA', name: 'Decentraland' },
    ],
  };

  return NARRATIVE_CLUSTERS.map((cluster, idx) => {
    const tokens = (demoTokens[cluster.id] || []).map((token, tokenIdx) => {
      const baseMentions = [50000, 30000, 20000, 15000, 10000][tokenIdx] || 5000;
      const mentions = baseMentions + Math.floor(Math.random() * 10000);
      const sentiment = 50 + (Math.random() * 40 - 20);
      const priceChange = (Math.random() * 40 - 20);
      const socialScore = 60 + Math.random() * 30;

      return {
        address: `demo_${token.symbol.toLowerCase()}`,
        symbol: token.symbol,
        name: token.name,
        mentions,
        sentiment,
        priceChange24h: priceChange,
        socialScore,
      } as NarrativeToken;
    });

    const totalMentions = tokens.reduce((sum, t) => sum + t.mentions, 0);
    const avgSentiment = tokens.length > 0 
      ? tokens.reduce((sum, t) => sum + t.sentiment, 0) / tokens.length 
      : 50;

    const growthRates = [35.2, -15.8, 42.1, 8.5, -22.3, 18.7];
    const growthRate = growthRates[idx] || (Math.random() * 40 - 20);

    const heatScore = Math.round(
      Math.min(totalMentions / 1000, 50) + 
      (avgSentiment / 2) + 
      Math.min(Math.abs(growthRate), 30)
    );

    return {
      id: cluster.id,
      name: cluster.name,
      keywords: cluster.keywords,
      tokens,
      mentionCount: totalMentions,
      growthRate,
      sentiment: avgSentiment,
      heatScore,
      updatedAt: new Date().toISOString(),
    } as NarrativeCluster;
  });
}
