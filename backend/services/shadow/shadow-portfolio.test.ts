import { describe, it, expect } from 'vitest';
import { ShadowPortfolioManager } from './shadow-portfolio';

describe('shadow-portfolio', () => {
  describe('ShadowPortfolioManager', () => {
    it('creates portfolio', () => {
      const manager = new ShadowPortfolioManager();
      const portfolio = manager.create('agent1', 100);
      expect(portfolio.agentId).toBe('agent1');
      expect(portfolio.startingSol).toBe(100);
      expect(portfolio.isActive).toBe(true);
    });

    it('executes buy trade', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      const trade = manager.executeTrade('agent1', {
        action: 'BUY',
        tokenAddress: 'token1',
        tokenSymbol: 'TKN',
        amountSol: 10,
        priceAtTrade: 1.0,
      });
      expect(trade).toBeTruthy();
      expect(trade?.action).toBe('BUY');
      
      const portfolio = manager.getPortfolio('agent1');
      expect(portfolio?.holdings.has('token1')).toBe(true);
    });

    it('executes sell trade', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      manager.executeTrade('agent1', {
        action: 'BUY',
        tokenAddress: 'token1',
        tokenSymbol: 'TKN',
        amountSol: 10,
        priceAtTrade: 1.0,
      });
      const sellTrade = manager.executeTrade('agent1', {
        action: 'SELL',
        tokenAddress: 'token1',
        tokenSymbol: 'TKN',
        amountSol: 5,
        priceAtTrade: 1.5,
      });
      expect(sellTrade).toBeTruthy();
    });

    it('stops shadow mode', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      manager.stopShadowMode('agent1');
      const portfolio = manager.getPortfolio('agent1');
      expect(portfolio?.isActive).toBe(false);
    });

    it('updates prices', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      manager.executeTrade('agent1', {
        action: 'BUY',
        tokenAddress: 'token1',
        tokenSymbol: 'TKN',
        amountSol: 10,
        priceAtTrade: 1.0,
      });
      const priceMap = new Map([['token1', 1.5]]);
      manager.updatePrices('agent1', priceMap);
      const portfolio = manager.getPortfolio('agent1');
      const holding = portfolio?.holdings.get('token1');
      expect(holding?.currentPrice).toBe(1.5);
    });
  });
});
