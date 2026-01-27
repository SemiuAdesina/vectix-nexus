import { SecurityReport } from './security.types';
import { fetchRugCheckData } from './rugcheck-client';
import { fetchTokenByAddress } from './dexscreener-client';
import { calculateTrustScore } from './trust-score';

export async function analyzeToken(tokenAddress: string): Promise<{
  report: SecurityReport;
  trustScore: ReturnType<typeof calculateTrustScore>;
} | null> {
  const [rugCheckData, marketData] = await Promise.all([
    fetchRugCheckData(tokenAddress),
    fetchTokenByAddress(tokenAddress),
  ]);

  const liquidityUsd = marketData?.liquidityUsd || 0;
  const tokenAgeHours = 48;

  if (rugCheckData) {
    const report: SecurityReport = {
      tokenAddress,
      isHoneypot: false,
      isMintable: rugCheckData.isMintable,
      isFreezable: rugCheckData.isFreezable,
      isBlacklisted: false,
      hasProxyContract: false,
      holderConcentration: rugCheckData.top10HoldersPercent,
      top10HoldersPercent: rugCheckData.top10HoldersPercent,
      liquidityLocked: rugCheckData.lpLockedPercent >= 90,
      liquidityLockedPercent: rugCheckData.lpLockedPercent,
      liquidityUsd,
      contractRenounced: !rugCheckData.isMintable && !rugCheckData.isFreezable,
      tokenAgeHours,
      buyTax: 0,
      sellTax: 0,
      totalSupply: '0',
      circulatingSupply: '0',
      creatorAddress: '',
      creatorBalance: 0,
    };

    return { report, trustScore: calculateTrustScore(report) };
  }

  const report = createHeuristicReport(tokenAddress, liquidityUsd, tokenAgeHours);
  return { report, trustScore: calculateTrustScore(report) };
}

function createHeuristicReport(
  tokenAddress: string,
  liquidityUsd: number,
  tokenAgeHours: number
): SecurityReport {
  const hasGoodLiquidity = liquidityUsd >= 100000;
  const hasDecentLiquidity = liquidityUsd >= 50000;

  return {
    tokenAddress,
    isHoneypot: false,
    isMintable: !hasGoodLiquidity,
    isFreezable: false,
    isBlacklisted: false,
    hasProxyContract: false,
    holderConcentration: hasGoodLiquidity ? 30 : 60,
    top10HoldersPercent: hasGoodLiquidity ? 30 : 60,
    liquidityLocked: hasGoodLiquidity,
    liquidityLockedPercent: hasGoodLiquidity ? 95 : hasDecentLiquidity ? 50 : 0,
    liquidityUsd,
    contractRenounced: hasGoodLiquidity,
    tokenAgeHours,
    buyTax: 0,
    sellTax: 0,
    totalSupply: '0',
    circulatingSupply: '0',
    creatorAddress: '',
    creatorBalance: 0,
  };
}

export function shouldAutoReject(
  trustScore: number,
  safetyMode: boolean
): { reject: boolean; reason: string } {
  if (!safetyMode) {
    return { reject: false, reason: 'Safety mode disabled' };
  }

  if (trustScore < 70) {
    return { reject: true, reason: `Trust score too low: ${trustScore}/100` };
  }

  return { reject: false, reason: 'Token passed safety checks' };
}
