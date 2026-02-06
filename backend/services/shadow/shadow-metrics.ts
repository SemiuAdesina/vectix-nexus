import { ShadowPortfolio, PerformanceMetrics, ReportCard, ShadowHolding } from './shadow.types';

export function calculateMetrics(portfolio: ShadowPortfolio): PerformanceMetrics {
  const pnls = portfolio.trades.map(t => t.pnlSol || 0);
  const wins = pnls.filter(p => p > 0);
  const losses = pnls.filter(p => p < 0);

  return {
    startingBalance: portfolio.startingSol,
    endingBalance: portfolio.currentValueSol,
    totalPnlSol: portfolio.currentValueSol - portfolio.startingSol,
    totalPnlPercent: ((portfolio.currentValueSol - portfolio.startingSol) / portfolio.startingSol) * 100,
    totalTrades: portfolio.trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: portfolio.trades.length > 0 ? (wins.length / portfolio.trades.length) * 100 : 0,
    avgWinSol: wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0,
    avgLossSol: losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0,
    largestWin: Math.max(0, ...pnls),
    largestLoss: Math.abs(Math.min(0, ...pnls)),
    sharpeRatio: calcSharpe(pnls),
  };
}

function calcSharpe(returns: number[]): number {
  if (returns.length < 2) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((sum, r) => sum + (r - avg) ** 2, 0) / returns.length);
  return std > 0 ? avg / std : 0;
}

const MIN_TRADES_FOR_GO_LIVE = 10;

export function getRecommendation(m: PerformanceMetrics): 'GO_LIVE' | 'CONTINUE_TESTING' | 'NEEDS_ADJUSTMENT' {
  if (m.totalTrades < MIN_TRADES_FOR_GO_LIVE) return 'CONTINUE_TESTING';
  if (m.totalPnlPercent > 5 && m.winRate > 50 && m.sharpeRatio > 0.5) return 'GO_LIVE';
  if (m.totalPnlPercent < -10 || m.winRate < 30) return 'NEEDS_ADJUSTMENT';
  return 'CONTINUE_TESTING';
}

export function buildSummary(m: PerformanceMetrics): string {
  const pnlStr = m.totalPnlSol >= 0 ? `+${m.totalPnlSol.toFixed(2)}` : m.totalPnlSol.toFixed(2);
  return `${m.totalTrades} trades, ${pnlStr} SOL (${m.totalPnlPercent.toFixed(1)}%), ${m.winRate.toFixed(0)}% win rate`;
}

export function generateReport(portfolio: ShadowPortfolio): ReportCard {
  const metrics = calculateMetrics(portfolio);
  const holdings = Array.from(portfolio.holdings.values());
  const sorted = [...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent);

  return {
    agentId: portfolio.agentId,
    periodStart: portfolio.startedAt,
    periodEnd: new Date(),
    durationHours: (Date.now() - portfolio.startedAt.getTime()) / 3600000,
    metrics,
    trades: portfolio.trades,
    topPerformers: sorted.slice(0, 3),
    worstPerformers: sorted.slice(-3).reverse(),
    recommendation: getRecommendation(metrics),
    summary: buildSummary(metrics),
  };
}

