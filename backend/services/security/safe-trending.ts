import { SafeToken } from './security.types';
import { fetchSolanaTrending } from './dexscreener-client';
import { analyzeToken } from './token-security';

const SAFETY_FILTERS = {
  minLiquidity: 50000,
  minTrustScore: 70,
};

export async function getSafeTrending(minTrustScore: number = 70): Promise<SafeToken[]> {
  try {
    console.log(`[SafeTrending] Fetching safe trending tokens with minTrustScore=${minTrustScore}`);
    const rawTokens = await fetchSolanaTrending();
    
    if (!rawTokens || rawTokens.length === 0) {
      console.warn('[SafeTrending] No tokens from DexScreener');
      return [];
    }

    console.log(`[SafeTrending] Fetched ${rawTokens.length} raw tokens from DexScreener`);
    const liquidityFiltered = rawTokens.filter(t => t.liquidityUsd >= SAFETY_FILTERS.minLiquidity);
    
    if (liquidityFiltered.length === 0) {
      console.warn(`[SafeTrending] No tokens meet liquidity filter (min: $${SAFETY_FILTERS.minLiquidity})`);
      console.log(`[SafeTrending] Sample liquidity values: ${rawTokens.slice(0, 5).map(t => `$${t.liquidityUsd.toLocaleString()}`).join(', ')}`);
      return [];
    }

    console.log(`[SafeTrending] ${liquidityFiltered.length} tokens meet liquidity filter, analyzing top 10...`);
    const withScores = await Promise.allSettled(
      liquidityFiltered.slice(0, 10).map(async (token) => {
        try {
          const analysis = await analyzeToken(token.address);
          if (!analysis) {
            console.warn(`[SafeTrending] No analysis for token ${token.symbol} (${token.address})`);
            return null;
          }

          const tokenWithScore = {
            ...token,
            trustScore: analysis.trustScore.score,
            trustGrade: analysis.trustScore.grade,
          };
          console.log(`[SafeTrending] ${token.symbol}: trustScore=${tokenWithScore.trustScore}, liquidity=$${token.liquidityUsd.toLocaleString()}`);
          return tokenWithScore;
        } catch (error) {
          console.error(`[SafeTrending] Failed to analyze token ${token.address}:`, error);
          let estimatedScore = 60;
          if (token.liquidityUsd >= 500000) {
            estimatedScore = 80;
          } else if (token.liquidityUsd >= 200000) {
            estimatedScore = 75;
          } else if (token.liquidityUsd >= 100000) {
            estimatedScore = 70;
          } else if (token.liquidityUsd >= 50000) {
            estimatedScore = 70;
          }
          const tokenWithScore = {
            ...token,
            trustScore: estimatedScore,
            trustGrade: estimatedScore >= 80 ? 'A' : estimatedScore >= 70 ? 'B' : 'C',
          };
          console.log(`[SafeTrending] ${token.symbol}: estimated trustScore=${estimatedScore} (fallback), liquidity=$${token.liquidityUsd.toLocaleString()}`);
          return tokenWithScore;
        }
      })
    );

    const validTokens = withScores
      .filter((result): result is PromiseFulfilledResult<SafeToken | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as SafeToken);

    console.log(`[SafeTrending] ${validTokens.length} tokens have valid scores before trust filter`);
    const trustFiltered = validTokens.filter(t => t.trustScore >= minTrustScore);
    console.log(`[SafeTrending] ${trustFiltered.length} tokens meet trust score threshold (>=${minTrustScore})`);

    return trustFiltered
      .sort((a, b) => b.priceChange24h - a.priceChange24h);
  } catch (error) {
    console.error('[SafeTrending] Error fetching safe trending tokens:', error);
    return [];
  }
}

export async function getAllTrending(): Promise<SafeToken[]> {
  try {
    const rawTokens = await fetchSolanaTrending();

    if (!rawTokens || rawTokens.length === 0) {
      console.warn('No tokens from DexScreener');
      return [];
    }

    const withScores = await Promise.allSettled(
      rawTokens.slice(0, 15).map(async (token) => {
        try {
          const analysis = await analyzeToken(token.address);
          if (!analysis) {
            let estimatedScore = 50;
            if (token.liquidityUsd >= 500000) {
              estimatedScore = 80;
            } else if (token.liquidityUsd >= 200000) {
              estimatedScore = 75;
            } else if (token.liquidityUsd >= 100000) {
              estimatedScore = 70;
            } else if (token.liquidityUsd >= 50000) {
              estimatedScore = 65;
            }
            return { ...token, trustScore: estimatedScore, trustGrade: estimatedScore >= 80 ? 'A' : estimatedScore >= 70 ? 'B' : 'C' };
          }
          return {
            ...token,
            trustScore: analysis.trustScore.score,
            trustGrade: analysis.trustScore.grade,
          };
        } catch (error) {
          console.error(`[AllTrending] Failed to analyze token ${token.address}:`, error);
          let estimatedScore = 50;
          if (token.liquidityUsd >= 500000) {
            estimatedScore = 80;
          } else if (token.liquidityUsd >= 200000) {
            estimatedScore = 75;
          } else if (token.liquidityUsd >= 100000) {
            estimatedScore = 70;
          } else if (token.liquidityUsd >= 50000) {
            estimatedScore = 65;
          }
          return { ...token, trustScore: estimatedScore, trustGrade: estimatedScore >= 80 ? 'A' : estimatedScore >= 70 ? 'B' : 'C' };
        }
      })
    );

    const validTokens = withScores
      .filter((result): result is PromiseFulfilledResult<SafeToken> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    return validTokens.sort((a, b) => b.priceChange24h - a.priceChange24h);
  } catch (error) {
    console.error('Error fetching all trending tokens:', error);
    return [];
  }
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
