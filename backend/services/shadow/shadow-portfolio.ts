import { ShadowPortfolio, ShadowTrade, ShadowHolding, ReportCard } from './shadow.types';
import { generateReport } from './shadow-metrics';
import { randomUUID } from 'crypto';

export class ShadowPortfolioManager {
  private portfolios: Map<string, ShadowPortfolio> = new Map();

  create(agentId: string, startingSol: number = 10): ShadowPortfolio {
    const portfolio: ShadowPortfolio = {
      agentId,
      startingSol,
      currentValueSol: startingSol,
      holdings: new Map(),
      trades: [],
      startedAt: new Date(),
      isActive: true,
    };
    this.portfolios.set(agentId, portfolio);
    return portfolio;
  }

  executeTrade(agentId: string, trade: Omit<ShadowTrade, 'id' | 'timestamp'>): ShadowTrade | null {
    const portfolio = this.portfolios.get(agentId);
    if (!portfolio || !portfolio.isActive) return null;

    const fullTrade: ShadowTrade = { ...trade, id: randomUUID(), timestamp: new Date() };

    if (trade.action === 'BUY') {
      this.executeBuy(portfolio, fullTrade);
    } else {
      this.executeSell(portfolio, fullTrade);
    }

    portfolio.trades.push(fullTrade);
    this.updatePortfolioValue(portfolio);
    return fullTrade;
  }

  private executeBuy(portfolio: ShadowPortfolio, trade: ShadowTrade): void {
    const tokenAmount = trade.amountSol / trade.priceAtTrade;
    const existing = portfolio.holdings.get(trade.tokenAddress);

    if (existing) {
      const totalAmount = existing.amount + tokenAmount;
      existing.avgBuyPrice = (existing.avgBuyPrice * existing.amount + trade.priceAtTrade * tokenAmount) / totalAmount;
      existing.amount = totalAmount;
    } else {
      portfolio.holdings.set(trade.tokenAddress, {
        tokenAddress: trade.tokenAddress,
        tokenSymbol: trade.tokenSymbol,
        amount: tokenAmount,
        avgBuyPrice: trade.priceAtTrade,
        currentPrice: trade.priceAtTrade,
        valueSol: trade.amountSol,
        pnlSol: 0,
        pnlPercent: 0,
      });
    }
    portfolio.currentValueSol -= trade.amountSol;
  }

  private executeSell(portfolio: ShadowPortfolio, trade: ShadowTrade): void {
    const holding = portfolio.holdings.get(trade.tokenAddress);
    if (!holding) return;

    const soldAmount = Math.min(holding.amount, trade.amountSol / trade.priceAtTrade);
    holding.amount -= soldAmount;
    if (holding.amount <= 0.0001) portfolio.holdings.delete(trade.tokenAddress);
    portfolio.currentValueSol += trade.amountSol;
  }

  private updatePortfolioValue(portfolio: ShadowPortfolio): void {
    let holdingsValue = 0;
    for (const holding of portfolio.holdings.values()) {
      holding.valueSol = holding.amount * holding.currentPrice;
      holding.pnlSol = holding.valueSol - holding.amount * holding.avgBuyPrice;
      holding.pnlPercent = (holding.pnlSol / (holding.amount * holding.avgBuyPrice)) * 100;
      holdingsValue += holding.valueSol;
    }
    const totalSpentOnBuys = portfolio.trades
      .filter(t => t.action === 'BUY')
      .reduce((sum, t) => sum + t.amountSol, 0);
    const totalReceivedFromSells = portfolio.trades
      .filter(t => t.action === 'SELL')
      .reduce((sum, t) => sum + t.amountSol, 0);
    const remainingSol = portfolio.startingSol - totalSpentOnBuys + totalReceivedFromSells;
    portfolio.currentValueSol = holdingsValue + remainingSol;
  }

  updatePrices(agentId: string, prices: Map<string, number>): void {
    const portfolio = this.portfolios.get(agentId);
    if (!portfolio) return;
    for (const [address, price] of prices) {
      const holding = portfolio.holdings.get(address);
      if (holding) holding.currentPrice = price;
    }
    this.updatePortfolioValue(portfolio);
  }

  generateReport(agentId: string): ReportCard | null {
    const portfolio = this.portfolios.get(agentId);
    return portfolio ? generateReport(portfolio) : null;
  }

  getPortfolio(agentId: string): ShadowPortfolio | undefined {
    return this.portfolios.get(agentId);
  }

  stopShadowMode(agentId: string): void {
    const portfolio = this.portfolios.get(agentId);
    if (portfolio) portfolio.isActive = false;
  }
}
