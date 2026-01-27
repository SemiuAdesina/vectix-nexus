export type RuleType =
  | 'MAX_POSITION_SIZE'
  | 'MIN_LIQUIDITY'
  | 'MAX_DAILY_TRADES'
  | 'MAX_LOSS_PER_TRADE'
  | 'BLOCKED_TOKENS'
  | 'REQUIRED_MARKET_CAP'
  | 'MAX_PORTFOLIO_CONCENTRATION'
  | 'MIN_TRUST_SCORE';

export interface SupervisorRule {
  id: string;
  type: RuleType;
  enabled: boolean;
  params: Record<string, number | string | string[]>;
  description: string;
}

export interface TradeRequest {
  agentId: string;
  action: 'BUY' | 'SELL';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  portfolioValueSol: number;
  tokenLiquidity: number;
  tokenMarketCap: number;
  dailyTradeCount: number;
  trustScore?: number;
  currentHoldings?: Map<string, number>;
}

export interface RuleViolation {
  ruleId: string;
  ruleType: RuleType;
  message: string;
  severity: 'warning' | 'block';
}

export interface SupervisorDecision {
  approved: boolean;
  violations: RuleViolation[];
  timestamp: Date;
  request: TradeRequest;
}

export const DEFAULT_RULES: SupervisorRule[] = [
  {
    id: 'max-position',
    type: 'MAX_POSITION_SIZE',
    enabled: true,
    params: { maxPercent: 10 },
    description: 'Cannot invest more than 10% of portfolio in single token',
  },
  {
    id: 'min-liquidity',
    type: 'MIN_LIQUIDITY',
    enabled: true,
    params: { minUsd: 50000 },
    description: 'Token must have at least $50k liquidity',
  },
  {
    id: 'max-daily-trades',
    type: 'MAX_DAILY_TRADES',
    enabled: true,
    params: { maxTrades: 20 },
    description: 'Maximum 20 trades per day',
  },
  {
    id: 'max-loss',
    type: 'MAX_LOSS_PER_TRADE',
    enabled: true,
    params: { maxLossPercent: 5 },
    description: 'Single trade cannot risk more than 5% portfolio loss',
  },
  {
    id: 'min-mcap',
    type: 'REQUIRED_MARKET_CAP',
    enabled: false,
    params: { minUsd: 100000 },
    description: 'Token must have at least $100k market cap',
  },
  {
    id: 'max-concentration',
    type: 'MAX_PORTFOLIO_CONCENTRATION',
    enabled: true,
    params: { maxPercent: 30 },
    description: 'Single token cannot exceed 30% of portfolio',
  },
  {
    id: 'min-trust-score',
    type: 'MIN_TRUST_SCORE',
    enabled: true,
    params: { minScore: 70 },
    description: 'Token must have Trust Score of at least 70 (Safety Mode)',
  },
];

