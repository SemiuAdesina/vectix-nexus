import { GoPlusTokenData } from './security.types';

const GOPLUS_BASE_URL = 'https://api.gopluslabs.io/api/v1';
const SOLANA_CHAIN_ID = 'solana';

interface GoPlusResponse {
  code: number;
  message: string;
  result: Record<string, GoPlusTokenData>;
}

export async function fetchGoPlusData(tokenAddress: string): Promise<GoPlusTokenData | null> {
  try {
    const url = `${GOPLUS_BASE_URL}/token_security/${SOLANA_CHAIN_ID}?contract_addresses=${tokenAddress}`;
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.GOPLUS_API_KEY?.trim();
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      console.error('GoPlus API error:', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as GoPlusResponse;

    if (data.code !== 1 || !data.result) {
      console.error('GoPlus invalid response:', data.message);
      return null;
    }

    const tokenData = data.result[tokenAddress.toLowerCase()] || data.result[tokenAddress];
    return tokenData || null;
  } catch (error) {
    console.error('GoPlus fetch error:', error);
    return null;
  }
}

export function parseGoPlusData(data: GoPlusTokenData): {
  isHoneypot: boolean;
  isMintable: boolean;
  isFreezable: boolean;
  isBlacklisted: boolean;
  hasProxyContract: boolean;
  buyTax: number;
  sellTax: number;
  top10HoldersPercent: number;
  liquidityLockedPercent: number;
  contractRenounced: boolean;
  creatorAddress: string;
  creatorBalance: number;
  totalSupply: string;
  holderCount: number;
} {
  const holders = data.holders || [];
  const top10Percent = holders
    .slice(0, 10)
    .reduce((sum, h) => sum + (h.percent || 0), 0);

  const lpHolders = data.lp_holders || [];
  const lockedLp = lpHolders.filter(h => h.is_locked === 1);
  const lockedPercent = lockedLp.reduce((sum, h) => sum + (h.percent || 0), 0);

  const hasOwnerControl = 
    data.can_take_back_ownership === '1' || 
    data.hidden_owner === '1' ||
    data.owner_change_balance === '1';

  return {
    isHoneypot: data.is_honeypot === '1',
    isMintable: data.is_mintable === '1',
    isFreezable: data.transfer_pausable === '1',
    isBlacklisted: data.is_blacklisted === '1',
    hasProxyContract: data.is_proxy === '1',
    buyTax: parseFloat(data.buy_tax || '0') * 100,
    sellTax: parseFloat(data.sell_tax || '0') * 100,
    top10HoldersPercent: top10Percent * 100,
    liquidityLockedPercent: lockedPercent * 100,
    contractRenounced: !hasOwnerControl,
    creatorAddress: data.creator_address || '',
    creatorBalance: parseFloat(data.creator_percent || '0') * 100,
    totalSupply: data.total_supply || '0',
    holderCount: parseInt(data.holder_count || '0', 10),
  };
}
