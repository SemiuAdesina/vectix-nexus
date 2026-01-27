export interface RiskFlag {
  type: 'HIGH_SLIPPAGE' | 'DRAINER_DETECTED' | 'UNKNOWN_PROGRAM' | 'EXCESSIVE_LOSS';
  severity: 'warning' | 'critical';
  message: string;
}

export interface PreflightStats {
  total: number;
  approved: number;
  blocked: number;
  blockedReasons: string[];
}

export interface PreflightDecision {
  approved: boolean;
  action: string;
  reason: string;
  timestamp: string;
  riskFlags: RiskFlag[];
}

export type RuleType =
  | 'MAX_POSITION_SIZE'
  | 'MIN_LIQUIDITY'
  | 'MAX_DAILY_TRADES'
  | 'MAX_LOSS_PER_TRADE'
  | 'BLOCKED_TOKENS'
  | 'REQUIRED_MARKET_CAP'
  | 'MAX_PORTFOLIO_CONCENTRATION';

export interface SupervisorRule {
  id: string;
  type: RuleType;
  enabled: boolean;
  params: Record<string, number | string | string[]>;
  description: string;
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
  timestamp: string;
}

export interface ShadowTrade {
  id: string;
  timestamp: string;
  action: 'BUY' | 'SELL';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  priceAtTrade: number;
  currentPrice?: number;
  pnlSol?: number;
  pnlPercent?: number;
}

export interface ShadowHolding {
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  valueSol: number;
  pnlSol: number;
  pnlPercent: number;
}

export interface ShadowPortfolio {
  agentId: string;
  startingSol: number;
  currentValueSol: number;
  holdings: ShadowHolding[];
  trades: ShadowTrade[];
  startedAt: string;
  isActive: boolean;
}

export interface PerformanceMetrics {
  startingBalance: number;
  endingBalance: number;
  totalPnlSol: number;
  totalPnlPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWinSol: number;
  avgLossSol: number;
  largestWin: number;
  largestLoss: number;
  sharpeRatio: number;
}

export interface ReportCard {
  agentId: string;
  periodStart: string;
  periodEnd: string;
  durationHours: number;
  metrics: PerformanceMetrics;
  trades: ShadowTrade[];
  topPerformers: ShadowHolding[];
  worstPerformers: ShadowHolding[];
  recommendation: 'GO_LIVE' | 'CONTINUE_TESTING' | 'NEEDS_ADJUSTMENT';
  summary: string;
}

export interface TEEStatus {
  available: boolean;
  provider: string;
  enclaveId: string | null;
  attestationValid: boolean;
  keyCount: number;
}

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

export interface NarrativeStatus {
  available: boolean;
  message: string;
}
