const RUGCHECK_BASE = 'https://api.rugcheck.xyz/v1';

interface RugCheckResponse {
  mint: string;
  score: number;
  risks: RugCheckRisk[];
  tokenMeta?: {
    name: string;
    symbol: string;
  };
  topHolders?: { pct: number }[];
  markets?: { lp?: { lpLockedPct: number } }[];
  freezeAuthority: string | null;
  mintAuthority: string | null;
}

interface RugCheckRisk {
  name: string;
  value: string;
  level: 'warn' | 'danger' | 'good';
  description: string;
}

export interface RugCheckResult {
  score: number;
  isMintable: boolean;
  isFreezable: boolean;
  lpLockedPercent: number;
  top10HoldersPercent: number;
  risks: { name: string; level: string; description: string }[];
}

export async function fetchRugCheckData(tokenAddress: string): Promise<RugCheckResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${RUGCHECK_BASE}/tokens/${tokenAddress}/report`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RugCheckResponse;

    const top10Pct = (data.topHolders || [])
      .slice(0, 10)
      .reduce((sum, h) => sum + (h.pct || 0), 0);

    const lpLockedRaw = data.markets?.[0]?.lp?.lpLockedPct || 0;
    const lpLocked = Math.min(lpLockedRaw * 100, 100);

    return {
      score: data.score || 0,
      isMintable: data.mintAuthority !== null,
      isFreezable: data.freezeAuthority !== null,
      lpLockedPercent: lpLocked,
      top10HoldersPercent: top10Pct,
      risks: (data.risks || []).map(r => ({
        name: r.name,
        level: r.level,
        description: r.description,
      })),
    };
  } catch (error) {
    console.error('RugCheck fetch error:', error);
    return null;
  }
}

