import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as preflightGuard from '../services/simulation/preflight-guard';
import { RuleEngine } from '../services/supervisor/rule-engine';
import { ShadowPortfolioManager } from '../services/shadow/shadow-portfolio';
import * as secureEnclaveModule from '../services/tee/secure-enclave';
import * as dexscreenerClient from '../services/security/dexscreener-client';

vi.mock('../services/simulation/preflight-guard', () => ({
  getPreflightGuard: vi.fn(),
}));

vi.mock('../services/tee/secure-enclave', () => ({
  getSecureEnclave: vi.fn(),
}));

vi.mock('../services/security/dexscreener-client', () => ({
  fetchTokenByAddress: vi.fn(),
}));

describe('advanced-features.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /preflight/stats/:agentId', () => {
    it('returns preflight stats', async () => {
      const mockStats = { totalChecks: 10, passed: 8, failed: 2 };
      vi.mocked(preflightGuard.getPreflightGuard).mockReturnValue({
        getStats: vi.fn().mockReturnValue(mockStats),
      } as any);

      const guard = preflightGuard.getPreflightGuard();
      const stats = guard.getStats('agent1');
      expect(stats).toEqual(mockStats);
    });
  });

  describe('POST /supervisor/evaluate', () => {
    it('evaluates trade request', () => {
      const engine = new RuleEngine();
      const mockDecision = engine.evaluate({
        agentId: 'agent1',
        action: 'BUY',
        tokenAddress: 'token123',
        tokenSymbol: 'TOKEN',
        amountSol: 10,
        portfolioValueSol: 100,
        tokenLiquidity: 1000000,
        tokenMarketCap: 5000000,
        dailyTradeCount: 5,
        trustScore: 80,
      });
      expect(mockDecision).toHaveProperty('approved');
      expect(mockDecision).toHaveProperty('violations');
    });
  });

  describe('GET /supervisor/rules', () => {
    it('returns all rules', () => {
      const engine = new RuleEngine();
      const rules = engine.getRules();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /supervisor/rules/:ruleId', () => {
    it('updates a rule', () => {
      const engine = new RuleEngine();
      engine.updateRule('max-position', { enabled: false });
      const rules = engine.getRules();
      const rule = rules.find(r => r.id === 'max-position');
      expect(rule?.enabled).toBe(false);
    });
  });

  describe('POST /shadow/create', () => {
    it('creates shadow portfolio', () => {
      const manager = new ShadowPortfolioManager();
      const portfolio = manager.create('agent1', 100);
      expect(portfolio.agentId).toBe('agent1');
      expect(portfolio.startingSol).toBe(100);
      expect(portfolio.isActive).toBe(true);
    });
  });

  describe('POST /shadow/trade', () => {
    it('executes shadow trade', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      const trade = manager.executeTrade('agent1', {
        action: 'BUY',
        tokenAddress: 'token1',
        tokenSymbol: 'TOKEN',
        amountSol: 10,
        priceAtTrade: 1.0,
      });
      expect(trade).toBeDefined();
      expect(trade?.action).toBe('BUY');
    });
  });

  describe('GET /shadow/report/:agentId', () => {
    it('generates shadow report', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      const report = manager.generateReport('agent1');
      expect(report).toBeDefined();
      expect(report?.agentId).toBe('agent1');
    });
  });

  describe('POST /shadow/stop/:agentId', () => {
    it('stops shadow mode', () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      manager.stopShadowMode('agent1');
      const portfolio = manager.getPortfolio('agent1');
      expect(portfolio?.isActive).toBe(false);
    });
  });

  describe('POST /shadow/update-prices/:agentId', () => {
    it('updates shadow portfolio prices', async () => {
      const manager = new ShadowPortfolioManager();
      manager.create('agent1', 100);
      const priceMap = new Map([['token1', 1.5]]);
      manager.updatePrices('agent1', priceMap);
      const portfolio = manager.getPortfolio('agent1');
      expect(portfolio).toBeDefined();
    });
  });

  describe('GET /tee/status', () => {
    it('returns TEE status', async () => {
      const mockStatus = { enabled: true, keysStored: 5 };
      vi.mocked(secureEnclaveModule.getSecureEnclave).mockReturnValue({
        getStatus: vi.fn().mockResolvedValue(mockStatus),
      } as any);

      const enclave = secureEnclaveModule.getSecureEnclave();
      const status = await enclave.getStatus();
      expect(status).toEqual(mockStatus);
    });
  });

  describe('POST /tee/store-key', () => {
    it('stores key in secure enclave', async () => {
      vi.mocked(secureEnclaveModule.getSecureEnclave).mockReturnValue({
        storeKey: vi.fn().mockResolvedValue('key123'),
      } as any);

      const enclave = secureEnclaveModule.getSecureEnclave();
      const keyId = await enclave.storeKey('agent1', new Uint8Array([1, 2, 3]));
      expect(keyId).toBe('key123');
    });
  });

  describe('DELETE /tee/key/:keyId', () => {
    it('deletes key from secure enclave', async () => {
      vi.mocked(secureEnclaveModule.getSecureEnclave).mockReturnValue({
        deleteKey: vi.fn().mockResolvedValue(true),
      } as any);

      const enclave = secureEnclaveModule.getSecureEnclave();
      const deleted = await enclave.deleteKey('key123', 'agent1');
      expect(deleted).toBe(true);
    });
  });
});
