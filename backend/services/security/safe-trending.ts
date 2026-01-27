import { SafeToken } from './security.types';
import { fetchSolanaTrending } from './dexscreener-client';
import { analyzeToken } from './token-security';

const SAFETY_FILTERS = {
  minLiquidity: 50000,
  minTrustScore: 70,
};

export async function getSafeTrending(minTrustScore: number = 70): Promise<SafeToken[]> {
  const rawTokens = await fetchSolanaTrending();
  const liquidityFiltered = rawTokens.filter(t => t.liquidityUsd >= SAFETY_FILTERS.minLiquidity);

  const withScores = await Promise.all(
    liquidityFiltered.slice(0, 10).map(async (token) => {
      const analysis = await analyzeToken(token.address);
      if (!analysis) return null;

      return {
        ...token,
        trustScore: analysis.trustScore.score,
        trustGrade: analysis.trustScore.grade,
      };
    })
  );

  const validTokens = withScores.filter((t): t is NonNullable<typeof t> => t !== null);

  return (validTokens as SafeToken[])
    .filter(t => t.trustScore >= minTrustScore)
    .sort((a, b) => b.priceChange24h - a.priceChange24h);
}

export async function getAllTrending(): Promise<SafeToken[]> {
  const rawTokens = await fetchSolanaTrending();

  const withScores = await Promise.all(
    rawTokens.slice(0, 15).map(async (token) => {
      const analysis = await analyzeToken(token.address);
      if (!analysis) {
        return { ...token, trustScore: 0, trustGrade: 'N/A' };
      }
      return {
        ...token,
        trustScore: analysis.trustScore.score,
        trustGrade: analysis.trustScore.grade,
      };
    })
  );

  return withScores.sort((a, b) => b.priceChange24h - a.priceChange24h);
}

export async function getTokenByAddress(address: string): Promise<SafeToken | null> {
  const analysis = await analyzeToken(address);
  if (!analysis) return null;

  return {
    address,
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    priceUsd: 0,
    priceChange24h: 0,
    volume24h: 0,
    liquidityUsd: analysis.report.liquidityUsd,
    trustScore: analysis.trustScore.score,
    trustGrade: analysis.trustScore.grade,
    marketCap: 0,
  };
}
