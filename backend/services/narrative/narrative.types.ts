export interface NarrativeToken {
  address: string;
  symbol: string;
  name: string;
  mentions: number;
  sentiment: number;
  priceChange24h: number;
  socialScore: number;
}

export interface NarrativeCluster {
  id: string;
  name: string;
  keywords: string[];
  tokens: NarrativeToken[];
  mentionCount: number;
  growthRate: number;
  sentiment: number;
  heatScore: number;
  updatedAt: string;
}

export interface NarrativeSignal {
  clusterId: string;
  clusterName: string;
  signalType: 'HEATING_UP' | 'COOLING_DOWN' | 'BREAKOUT' | 'ROTATION';
  strength: number;
  topTokens: string[];
  message: string;
  timestamp: string;
}

export const NARRATIVE_CLUSTERS = [
  { id: 'ai-agents', name: 'AI Agents', keywords: ['ai', 'agent', 'gpt', 'llm', 'autonomous'], category: 'ai' },
  { id: 'dog-coins', name: 'Dog Coins', keywords: ['dog', 'doge', 'shib', 'wif', 'bonk'], category: 'meme' },
  { id: 'cat-coins', name: 'Cat Coins', keywords: ['cat', 'mew', 'popcat', 'kitty'], category: 'meme' },
  { id: 'politifi', name: 'PolitiFi', keywords: ['trump', 'biden', 'maga', 'political'], category: 'meme' },
  { id: 'defi-yield', name: 'DeFi Yield', keywords: ['yield', 'farm', 'stake', 'lp', 'apy'], category: 'defi' },
  { id: 'gaming', name: 'Gaming/Metaverse', keywords: ['game', 'nft', 'metaverse', 'play'], category: 'gaming' },
];

