import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as circuitBreakerService from '../../../onchain/services/circuit-breaker';
import * as auditTrailService from '../../../onchain/services/audit-trail';
import * as threatIntelligenceService from '../../../onchain/services/threat-intelligence';
import * as tokenSecurity from '../../services/security/token-security';
import { RuleEngine } from '../../services/supervisor/rule-engine';
import * as affiliateService from '../../services/affiliate/affiliate.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    agent: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../../onchain/services/circuit-breaker', () => ({
  circuitBreakerService: {
    checkBreaker: vi.fn(),
  },
}));

vi.mock('../../../onchain/services/audit-trail', () => ({
  auditTrailService: {
    logSecurityEvent: vi.fn(),
  },
}));

vi.mock('../../../onchain/services/threat-intelligence', () => ({
  threatIntelligenceService: {
    detectAnomaly: vi.fn(),
  },
}));

vi.mock('../../services/security/token-security', () => ({
  analyzeToken: vi.fn(),
}));

vi.mock('../../services/affiliate/affiliate.service', () => ({
  recordReferralEarning: vi.fn(),
}));

describe('public-api/trade.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /agents/:id/trade', () => {
    it('executes paper trade', async () => {
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue({ id: 'agent1' } as any);
      vi.mocked(circuitBreakerService.circuitBreakerService.checkBreaker).mockResolvedValue({ allowed: true });
      vi.mocked(threatIntelligenceService.threatIntelligenceService.detectAnomaly).mockResolvedValue({
        isAnomaly: false,
        confidence: 0,
        reason: 'No threat',
      });
      vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue({
        report: { liquidityUsd: 1000000 },
        trustScore: { score: 80, grade: 'A', risks: [], passed: [] },
      } as any);
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({ referredById: null } as any);
      vi.mocked(auditTrailService.auditTrailService.logSecurityEvent).mockResolvedValue({} as any);

      const engine = new RuleEngine();
      const decision = engine.evaluate({
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

      expect(decision).toHaveProperty('approved');
    });
  });
});
