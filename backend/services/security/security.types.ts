export interface SecurityReport {
  tokenAddress: string;
  isHoneypot: boolean;
  isMintable: boolean;
  isFreezable: boolean;
  isBlacklisted: boolean;
  hasProxyContract: boolean;
  holderConcentration: number;
  top10HoldersPercent: number;
  liquidityLocked: boolean;
  liquidityLockedPercent: number;
  liquidityUsd: number;
  contractRenounced: boolean;
  tokenAgeHours: number;
  buyTax: number;
  sellTax: number;
  totalSupply: string;
  circulatingSupply: string;
  creatorAddress: string;
  creatorBalance: number;
}

export interface TrustScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  risks: RiskItem[];
  passed: RiskItem[];
}

export interface RiskItem {
  id: string;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  passed: boolean;
  message: string;
}

export interface SafeToken {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidityUsd: number;
  trustScore: number;
  trustGrade: string;
  marketCap: number;
}

export interface GoPlusResponse {
  code: number;
  message: string;
  result: Record<string, GoPlusTokenData>;
}

export interface GoPlusTokenData {
  is_honeypot?: string;
  is_mintable?: string;
  can_take_back_ownership?: string;
  owner_change_balance?: string;
  hidden_owner?: string;
  selfdestruct?: string;
  is_proxy?: string;
  is_blacklisted?: string;
  transfer_pausable?: string;
  holder_count?: string;
  total_supply?: string;
  holders?: { address: string; percent: number }[];
  lp_holders?: { address: string; percent: number; is_locked?: number }[];
  buy_tax?: string;
  sell_tax?: string;
  creator_address?: string;
  creator_percent?: string;
  lp_total_supply?: string;
}

