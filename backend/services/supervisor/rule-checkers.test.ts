import { describe, it, expect } from 'vitest';
import {
  checkMaxPosition,
  checkMinLiquidity,
  checkMaxDailyTrades,
  checkMaxLoss,
  checkMarketCap,
  checkConcentration,
  checkTrustScore,
} from './rule-checkers';
import type { SupervisorRule, TradeRequest } from './supervisor.types';

describe('Rule Checkers', () => {
  const createRule = (type: string, params: Record<string, unknown>): SupervisorRule => ({
    id: `rule_${type}`,
    type: type as any,
    enabled: true,
    params,
    description: 'Test rule',
  });

  const createRequest = (overrides: Partial<TradeRequest> = {}): TradeRequest => ({
    agentId: 'agent1',
    tokenAddress: 'token123',
    amountSol: 1,
    portfolioValueSol: 100,
    tokenLiquidity: 1000000,
    tokenMarketCap: 5000000,
    dailyTradeCount: 5,
    trustScore: 80,
    ...overrides,
  });

  describe('checkMaxPosition', () => {
    it('allows position within limit', () => {
      const rule = createRule('MAX_POSITION_SIZE', { maxPercent: 10 });
      const request = createRequest({ amountSol: 5, portfolioValueSol: 100 });

      const result = checkMaxPosition(rule, request);
      expect(result).toBeNull();
    });

    it('blocks position exceeding limit', () => {
      const rule = createRule('MAX_POSITION_SIZE', { maxPercent: 10 });
      const request = createRequest({ amountSol: 15, portfolioValueSol: 100 });

      const result = checkMaxPosition(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });
  });

  describe('checkMinLiquidity', () => {
    it('allows trade with sufficient liquidity', () => {
      const rule = createRule('MIN_LIQUIDITY', { minUsd: 100000 });
      const request = createRequest({ tokenLiquidity: 1000000 });

      const result = checkMinLiquidity(rule, request);
      expect(result).toBeNull();
    });

    it('blocks trade with insufficient liquidity', () => {
      const rule = createRule('MIN_LIQUIDITY', { minUsd: 100000 });
      const request = createRequest({ tokenLiquidity: 50000 });

      const result = checkMinLiquidity(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });
  });

  describe('checkMaxDailyTrades', () => {
    it('allows trade within daily limit', () => {
      const rule = createRule('MAX_DAILY_TRADES', { maxTrades: 10 });
      const request = createRequest({ dailyTradeCount: 5 });

      const result = checkMaxDailyTrades(rule, request);
      expect(result).toBeNull();
    });

    it('blocks trade exceeding daily limit', () => {
      const rule = createRule('MAX_DAILY_TRADES', { maxTrades: 10 });
      const request = createRequest({ dailyTradeCount: 10 });

      const result = checkMaxDailyTrades(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });
  });

  describe('checkMarketCap', () => {
    it('allows trade with sufficient market cap', () => {
      const rule = createRule('REQUIRED_MARKET_CAP', { minUsd: 1000000 });
      const request = createRequest({ tokenMarketCap: 5000000 });

      const result = checkMarketCap(rule, request);
      expect(result).toBeNull();
    });

    it('blocks trade with insufficient market cap', () => {
      const rule = createRule('REQUIRED_MARKET_CAP', { minUsd: 1000000 });
      const request = createRequest({ tokenMarketCap: 500000 });

      const result = checkMarketCap(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });
  });

  describe('checkTrustScore', () => {
    it('allows trade with sufficient trust score', () => {
      const rule = createRule('MIN_TRUST_SCORE', { minScore: 50 });
      const request = createRequest({ trustScore: 80 });

      const result = checkTrustScore(rule, request);
      expect(result).toBeNull();
    });

    it('blocks trade with insufficient trust score', () => {
      const rule = createRule('MIN_TRUST_SCORE', { minScore: 50 });
      const request = createRequest({ trustScore: 30 });

      const result = checkTrustScore(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });

    it('blocks trade when trust score is missing', () => {
      const rule = createRule('MIN_TRUST_SCORE', { minScore: 50 });
      const request = createRequest({ trustScore: undefined });

      const result = checkTrustScore(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });
  });

  describe('checkConcentration', () => {
    it('allows trade within concentration limit', () => {
      const rule = createRule('MAX_PORTFOLIO_CONCENTRATION', { maxPercent: 20 });
      const request = createRequest({
        currentHoldings: new Map([['token123', 10]]),
        amountSol: 5,
        portfolioValueSol: 100,
      });

      const result = checkConcentration(rule, request);
      expect(result).toBeNull();
    });

    it('blocks trade exceeding concentration limit', () => {
      const rule = createRule('MAX_PORTFOLIO_CONCENTRATION', { maxPercent: 20 });
      const request = createRequest({
        currentHoldings: new Map([['token123', 15]]),
        amountSol: 10,
        portfolioValueSol: 100,
      });

      const result = checkConcentration(rule, request);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('block');
    });
  });
});
