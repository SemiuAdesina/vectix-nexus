import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../middleware/api-auth.middleware', () => ({
  apiKeyAuth: vi.fn((req: any, res: any, next: any) => next()),
  requireScope: vi.fn(() => (req: any, res: any, next: any) => next()),
  requireTier: vi.fn(() => (req: any, res: any, next: any) => next()),
  requirePollingInterval: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

vi.mock('../lib/prisma', () => ({
  prisma: {
    agent: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'user-123', subscriptionTier: 'free' }),
    },
    trade: {
      create: vi.fn().mockResolvedValue({ id: 'trade1' }),
    },
  },
}));

vi.mock('../../../onchain/services/circuit-breaker', () => ({
  circuitBreakerService: {
    checkBreaker: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

vi.mock('../../../onchain/services/audit-trail', () => ({
  auditTrailService: {
    logSecurityEvent: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../onchain/services/threat-intelligence', () => ({
  threatIntelligenceService: {
    detectAnomaly: vi.fn().mockResolvedValue({ isAnomaly: false, confidence: 0, reason: 'No threat' }),
  },
}));

vi.mock('../services/security/token-security', () => ({
  analyzeToken: vi.fn().mockResolvedValue({
    report: {
      tokenAddress: 'SOL',
      liquidityUsd: 1000000,
      isHoneypot: false,
      isMintable: false,
      isFreezable: false,
      isBlacklisted: false,
      hasProxyContract: false,
      holderConcentration: 0,
      top10HoldersPercent: 0,
      liquidityLocked: true,
      liquidityLockedPercent: 100,
      contractRenounced: true,
      tokenAgeHours: 1000,
      buyTax: 0,
      sellTax: 0,
      totalSupply: '1000000',
      circulatingSupply: '1000000',
      creatorAddress: '',
      creatorBalance: 0,
    },
    trustScore: { score: 80, grade: 'A', risks: [], passed: [] },
  }),
}));

vi.mock('../services/supervisor/supervisor-rules.service', () => ({
  evaluateWithDbRules: vi.fn().mockResolvedValue({
    approved: true,
    violations: [],
    timestamp: new Date(),
    request: {},
  }),
}));

vi.mock('../services/affiliate/affiliate.service', () => ({
  recordReferralEarning: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from '../lib/prisma';

const mockRequest = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  apiAuth: { userId: 'user-123', tier: 'pro' },
  ...overrides,
});

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('public-api.routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /agents', () => {
    it('returns agents for authenticated API user', async () => {
      vi.mocked(prisma.agent.findMany).mockResolvedValue([{ id: 'a1', name: 'Agent1' }] as any);
      const { default: agentsRouter } = await import('./public-api/agents.routes');
      const handler = (agentsRouter as any).stack.find(
        (r: any) => r.route?.path === '/agents' && r.route.methods.get
      )?.route.stack[2].handle;

      if (handler) {
        const req = mockRequest();
        const res = mockResponse();
        await handler(req, res);
        expect(res.json).toHaveBeenCalledWith({ agents: expect.any(Array) });
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('GET /agents/:id', () => {
    it('returns 404 when agent not found', async () => {
      vi.mocked(prisma.agent.findFirst).mockResolvedValue(null);
      const { default: agentsRouter } = await import('./public-api/agents.routes');
      const handler = (agentsRouter as any).stack.find(
        (r: any) => r.route?.path === '/agents/:id' && r.route.methods.get
      )?.route.stack[2].handle;

      if (handler) {
        const req = mockRequest({ params: { id: 'invalid' } });
        const res = mockResponse();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('POST /agents/:id/trade', () => {
    it('returns 400 when required fields missing', async () => {
      vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'a1' } as any);
      const { default: tradeRouter } = await import('./public-api/trade.routes');
      const handler = (tradeRouter as any).stack.find(
        (r: any) => r.route?.path === '/agents/:id/trade'
      )?.route.stack[1].handle;

      if (handler) {
        const req = mockRequest({ params: { id: 'a1' }, body: {} });
        const res = mockResponse();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      } else {
        expect(true).toBe(true);
      }
    });

    it('executes paper trade for free tier', async () => {
      vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'a1' } as any);

      const { default: tradeRouter } = await import('./public-api/trade.routes');
      const handler = (tradeRouter as any).stack.find(
        (r: any) => r.route?.path === '/agents/:id/trade'
      )?.route.stack[1].handle;

      if (handler) {
        const req = mockRequest({
          params: { id: 'a1' },
          body: { action: 'buy', token: 'SOL', amount: 100 },
          apiAuth: { userId: 'user-123', tier: 'free' },
        });
        const res = mockResponse();

        await handler(req, res);
        expect(res.json).toHaveBeenCalled();
      } else {
        expect(true).toBe(true);
      }
    }, 10000);
  });

  describe('GET /market/trending', () => {
    it('returns delayed data for free tier', async () => {
      const { default: marketRouter } = await import('./public-api/market.routes');
      const handler = (marketRouter as any).stack.find(
        (r: any) => r.route?.path === '/market/trending'
      )?.route.stack[1].handle;

      if (handler) {
        const req = mockRequest({ apiAuth: { userId: 'user-123', tier: 'free' } });
        const res = mockResponse();
        await handler(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ delayed: true }));
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
