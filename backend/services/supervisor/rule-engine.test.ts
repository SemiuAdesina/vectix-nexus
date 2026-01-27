import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngine } from './rule-engine';
import type { TradeRequest, SupervisorRule } from './supervisor.types';

describe('RuleEngine', () => {
  let engine: RuleEngine;

  beforeEach(() => {
    engine = new RuleEngine();
  });

  describe('evaluate', () => {
    it('approves valid trade request', () => {
      const request: TradeRequest = {
        agentId: 'agent1',
        tokenAddress: 'token123',
        amountSol: 1,
        portfolioValueSol: 100,
        tokenLiquidity: 1000000,
        tokenMarketCap: 5000000,
        dailyTradeCount: 5,
        trustScore: 80,
      };

      const decision = engine.evaluate(request);
      expect(decision.approved).toBe(true);
      expect(decision.violations).toEqual([]);
    });

    it('rejects trade when position size exceeds limit', () => {
      const request: TradeRequest = {
        agentId: 'agent1',
        tokenAddress: 'token123',
        amountSol: 50,
        portfolioValueSol: 100,
        tokenLiquidity: 1000000,
        tokenMarketCap: 5000000,
        dailyTradeCount: 5,
        trustScore: 80,
      };

      const decision = engine.evaluate(request);
      expect(decision.approved).toBe(false);
      expect(decision.violations.length).toBeGreaterThan(0);
      expect(decision.violations.some(v => v.ruleType === 'MAX_POSITION_SIZE')).toBe(true);
    });

    it('rejects trade when liquidity is too low', () => {
      const request: TradeRequest = {
        agentId: 'agent1',
        tokenAddress: 'token123',
        amountSol: 1,
        portfolioValueSol: 100,
        tokenLiquidity: 10000,
        tokenMarketCap: 5000000,
        dailyTradeCount: 5,
        trustScore: 80,
      };

      const decision = engine.evaluate(request);
      expect(decision.approved).toBe(false);
      expect(decision.violations.some(v => v.ruleType === 'MIN_LIQUIDITY')).toBe(true);
    });

    it('rejects trade when trust score is too low', () => {
      const request: TradeRequest = {
        agentId: 'agent1',
        tokenAddress: 'token123',
        amountSol: 1,
        portfolioValueSol: 100,
        tokenLiquidity: 1000000,
        tokenMarketCap: 5000000,
        dailyTradeCount: 5,
        trustScore: 30,
      };

      const decision = engine.evaluate(request);
      expect(decision.approved).toBe(false);
      expect(decision.violations.some(v => v.ruleType === 'MIN_TRUST_SCORE')).toBe(true);
    });
  });

  describe('updateRule', () => {
    it('updates existing rule', () => {
      engine.updateRule('max-position', { enabled: false });
      const rules = engine.getRules();
      const rule = rules.find(r => r.id === 'max-position');
      expect(rule?.enabled).toBe(false);
    });
  });

  describe('getRules', () => {
    it('returns all rules', () => {
      const rules = engine.getRules();
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every(r => r.id && r.type && r.enabled !== undefined)).toBe(true);
    });
  });
});
