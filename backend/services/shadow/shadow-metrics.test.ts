import { describe, it, expect } from 'vitest';
import * as shadowMetrics from './shadow-metrics';
import type { ShadowPortfolio } from './shadow.types';

describe('shadow-metrics', () => {
  describe('calculateMetrics', () => {
    it('calculates performance metrics', () => {
      const portfolio: ShadowPortfolio = {
        agentId: 'agent1',
        startingSol: 100,
        currentValueSol: 110,
        holdings: new Map(),
        trades: [
          { id: '1', action: 'BUY', amountSol: 10, priceAtTrade: 1, pnlSol: 5, timestamp: new Date() },
          { id: '2', action: 'SELL', amountSol: 5, priceAtTrade: 1.5, pnlSol: 2.5, timestamp: new Date() },
        ],
        startedAt: new Date(),
        isActive: true,
      };

      const metrics = shadowMetrics.calculateMetrics(portfolio);
      expect(metrics.totalPnlSol).toBe(10);
      expect(metrics.totalPnlPercent).toBe(10);
      expect(metrics.totalTrades).toBe(2);
      expect(metrics.winningTrades).toBe(2);
      expect(metrics.winRate).toBe(100);
    });
  });

  describe('getRecommendation', () => {
    it('recommends GO_LIVE for good performance', () => {
      const metrics = {
        totalPnlPercent: 10,
        winRate: 60,
        sharpeRatio: 1.0,
        totalTrades: 20,
      } as any;

      const recommendation = shadowMetrics.getRecommendation(metrics);
      expect(recommendation).toBe('GO_LIVE');
    });

    it('recommends NEEDS_ADJUSTMENT for poor performance', () => {
      const metrics = {
        totalPnlPercent: -15,
        winRate: 25,
        sharpeRatio: -0.5,
        totalTrades: 15,
      } as any;

      const recommendation = shadowMetrics.getRecommendation(metrics);
      expect(recommendation).toBe('NEEDS_ADJUSTMENT');
    });
  });

  describe('generateReport', () => {
    it('generates report card', () => {
      const portfolio: ShadowPortfolio = {
        agentId: 'agent1',
        startingSol: 100,
        currentValueSol: 110,
        holdings: new Map(),
        trades: [],
        startedAt: new Date(),
        isActive: true,
      };

      const report = shadowMetrics.generateReport(portfolio);
      expect(report.agentId).toBe('agent1');
      expect(report.metrics).toBeDefined();
    });
  });
});
