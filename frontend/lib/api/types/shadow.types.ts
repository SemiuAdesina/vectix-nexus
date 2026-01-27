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
