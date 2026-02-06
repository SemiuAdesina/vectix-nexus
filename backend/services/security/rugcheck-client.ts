const RUGCHECK_BASE = 'https://api.rugcheck.xyz/v1';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isSolanaAddress(value: string): boolean {
  return typeof value === 'string' && SOLANA_ADDRESS_REGEX.test(value.trim()) && !value.includes('/') && !value.includes(':');
}

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
  if (!isSolanaAddress(tokenAddress)) return null;
  try {
    const encoded = encodeURIComponent(tokenAddress.trim());
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    const apiKey = process.env.RUGCHECK_API_KEY?.trim();
    if (apiKey) headers['X-API-KEY'] = apiKey;
    const response = await fetch(`${RUGCHECK_BASE}/tokens/${encoded}/report`, { headers });

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

