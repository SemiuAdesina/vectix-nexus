import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as advancedFeatures from './advanced-features';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  API_ENDPOINTS: {
    preflight: { stats: (id: string) => `/api/preflight/stats/${id}` },
    supervisor: {
      rules: '/api/supervisor/rules',
      ruleDetail: (id: string) => `/api/supervisor/rules/${id}`,
      evaluate: '/api/supervisor/evaluate',
    },
    shadow: {
      create: '/api/shadow/create',
      report: (id: string) => `/api/shadow/report/${id}`,
      stop: (id: string) => `/api/shadow/stop/${id}`,
      updatePrices: (id: string) => `/api/shadow/update-prices/${id}`,
    },
    tee: {
      status: '/api/tee/status',
      storeKey: '/api/tee/store-key',
    },
    narrative: {
      status: '/api/narrative/status',
      clusters: '/api/narrative/clusters',
      signals: '/api/narrative/signals',
    },
  },
}));

describe('advanced-features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreflightStats', () => {
    it('fetches preflight stats', async () => {
      const mockStats = { totalChecks: 10, passed: 8, failed: 2 };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ stats: mockStats }),
      } as Response);

      const stats = await advancedFeatures.getPreflightStats('agent1');
      expect(stats).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getSupervisorRules', () => {
    it('fetches supervisor rules', async () => {
      const mockRules = [{ id: 'rule1', type: 'MAX_POSITION_SIZE', enabled: true }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ rules: mockRules }),
      } as Response);

      const rules = await advancedFeatures.getSupervisorRules();
      expect(rules).toEqual(mockRules);
    });
  });

  describe('updateSupervisorRule', () => {
    it('updates supervisor rule', async () => {
      (global.fetch as Mock).mockResolvedValue({ ok: true } as Response);

      await advancedFeatures.updateSupervisorRule('rule1', { enabled: false });
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('evaluateTrade', () => {
    it('evaluates trade request', async () => {
      const mockDecision = { approved: true, violations: [] };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ decision: mockDecision }),
      } as Response);

      const decision = await advancedFeatures.evaluateTrade({
        agentId: 'agent1',
        action: 'BUY',
        tokenAddress: 'token123',
        tokenSymbol: 'TOKEN',
        amountSol: 10,
        portfolioValueSol: 100,
        tokenLiquidity: 1000000,
        tokenMarketCap: 5000000,
        dailyTradeCount: 5,
      });
      expect(decision).toEqual(mockDecision);
    });
  });

  describe('createShadowPortfolio', () => {
    it('creates shadow portfolio', async () => {
      const mockPortfolio = { agentId: 'agent1', startingSol: 10, isActive: true };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ portfolio: mockPortfolio }),
      } as Response);

      const portfolio = await advancedFeatures.createShadowPortfolio('agent1', 10);
      expect(portfolio).toEqual(mockPortfolio);
    });
  });

  describe('getShadowReport', () => {
    it('fetches shadow report', async () => {
      const mockReport = { agentId: 'agent1', totalTrades: 5 };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ report: mockReport }),
      } as Response);

      const report = await advancedFeatures.getShadowReport('agent1');
      expect(report).toEqual(mockReport);
    });
  });

  describe('stopShadowMode', () => {
    it('stops shadow mode', async () => {
      (global.fetch as Mock).mockResolvedValue({ ok: true } as Response);

      await advancedFeatures.stopShadowMode('agent1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('updateShadowPrices', () => {
    it('updates shadow prices', async () => {
      const mockPortfolio = { agentId: 'agent1', currentValueSol: 110 };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: true, portfolio: mockPortfolio }),
      } as Response);

      const portfolio = await advancedFeatures.updateShadowPrices('agent1');
      expect(portfolio).toEqual(mockPortfolio);
    });

    it('returns null on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ success: false }),
      } as Response);

      const portfolio = await advancedFeatures.updateShadowPrices('agent1');
      expect(portfolio).toBeNull();
    });
  });

  describe('getTEEStatus', () => {
    it('fetches TEE status', async () => {
      const mockStatus = { enabled: true, keysStored: 5 };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ status: mockStatus }),
      } as Response);

      const status = await advancedFeatures.getTEEStatus();
      expect(status).toEqual(mockStatus);
    });
  });

  describe('storeKeyInTEE', () => {
    it('stores key in TEE', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ keyId: 'key123' }),
      } as Response);

      const keyId = await advancedFeatures.storeKeyInTEE('agent1', 'privateKey');
      expect(keyId).toBe('key123');
    });
  });

  describe('getNarrativeStatus', () => {
    it('fetches narrative status', async () => {
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ available: true, demoMode: false, message: 'Active' }),
      } as Response);

      const status = await advancedFeatures.getNarrativeStatus();
      expect(status.available).toBe(true);
      expect(status.demoMode).toBe(false);
    });
  });

  describe('getNarrativeClusters', () => {
    it('fetches narrative clusters', async () => {
      const mockClusters = [{ id: 'cluster1', name: 'Test Cluster' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ clusters: mockClusters }),
      } as Response);

      const clusters = await advancedFeatures.getNarrativeClusters();
      expect(clusters).toEqual(mockClusters);
    });
  });

  describe('getNarrativeSignals', () => {
    it('fetches narrative signals', async () => {
      const mockSignals = [{ id: 'signal1', type: 'HEATING_UP' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ signals: mockSignals }),
      } as Response);

      const signals = await advancedFeatures.getNarrativeSignals();
      expect(signals).toEqual(mockSignals);
    });
  });
});
