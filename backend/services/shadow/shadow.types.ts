export interface ShadowTrade {
  id: string;
  timestamp: Date;
  action: 'BUY' | 'SELL';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  priceAtTrade: number;
  currentPrice?: number;
  pnlSol?: number;
  pnlPercent?: number;
}

export interface ShadowPortfolio {
  agentId: string;
  startingSol: number;
  currentValueSol: number;
  holdings: Map<string, ShadowHolding>;
  trades: ShadowTrade[];
  startedAt: Date;
  isActive: boolean;
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

export interface ReportCard {
  agentId: string;
  periodStart: Date;
  periodEnd: Date;
  durationHours: number;
  metrics: PerformanceMetrics;
  trades: ShadowTrade[];
  topPerformers: ShadowHolding[];
  worstPerformers: ShadowHolding[];
  recommendation: 'GO_LIVE' | 'CONTINUE_TESTING' | 'NEEDS_ADJUSTMENT';
  summary: string;
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

