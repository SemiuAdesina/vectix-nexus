import { SafeToken } from './security.types';

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isSolanaAddress(value: string): boolean {
  return typeof value === 'string' && SOLANA_ADDRESS_REGEX.test(value.trim()) && !value.includes('/') && !value.includes(':');
}

interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { symbol: string };
  priceUsd: string;
  priceChange: { h24: number };
  volume: { h24: number };
  liquidity: { usd: number };
  fdv: number;
  pairCreatedAt: number;
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[];
}

export async function fetchSolanaTrending(): Promise<SafeToken[]> {
  try {
    const queries = ['meme', 'ai', 'pump', 'cat', 'dog'];
    const allPairs: DexScreenerPair[] = [];

    for (const query of queries) {
      const response = await fetch(`${DEXSCREENER_BASE}/search?q=${query}`);
      if (response.ok) {
        const data = (await response.json()) as DexScreenerResponse;
        if (data.pairs) {
          allPairs.push(...data.pairs.filter(p => p.chainId === 'solana'));
        }
      }
    }

    const uniquePairs = new Map<string, DexScreenerPair>();
    for (const pair of allPairs) {
      if (!uniquePairs.has(pair.baseToken.address)) {
        uniquePairs.set(pair.baseToken.address, pair);
      }
    }

    const sortedPairs = Array.from(uniquePairs.values())
      .filter(p => p.liquidity?.usd >= 10000)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 30);

    return sortedPairs.map(pair => ({
      address: pair.baseToken.address,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      priceUsd: parseFloat(pair.priceUsd) || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      volume24h: pair.volume?.h24 || 0,
      liquidityUsd: pair.liquidity?.usd || 0,
      trustScore: 0,
      trustGrade: 'N/A',
      marketCap: pair.fdv || 0,
    }));
  } catch (error) {
    console.error('DexScreener fetch error:', error);
    return [];
  }
}

export async function fetchTokenByAddress(address: string): Promise<SafeToken | null> {
  if (!isSolanaAddress(address)) return null;
  try {
    const encoded = encodeURIComponent(address.trim());
    const response = await fetch(`${DEXSCREENER_BASE}/tokens/${encoded}`);
    if (!response.ok) return null;

    const data = (await response.json()) as DexScreenerResponse;
    const pair = data.pairs?.[0];
    if (!pair) return null;

    return {
      address: pair.baseToken.address,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      priceUsd: parseFloat(pair.priceUsd) || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      volume24h: pair.volume?.h24 || 0,
      liquidityUsd: pair.liquidity?.usd || 0,
      trustScore: 0,
      trustGrade: 'N/A',
      marketCap: pair.fdv || 0,
    };
  } catch (error) {
    console.error('DexScreener token fetch error:', error);
    return null;
  }
}

export function calculateTokenAge(createdAt: number): number {
  const now = Date.now();
  const ageMs = now - createdAt;
  return Math.floor(ageMs / (1000 * 60 * 60));
}
