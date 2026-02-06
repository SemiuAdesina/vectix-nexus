import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEffectiveRules,
  updateRule,
  evaluateWithDbRules,
  clearRulesCache,
} from './supervisor-rules.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    supervisorRuleVersion: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 7 }),
      create: vi.fn().mockResolvedValue({ effectiveAt: new Date(Date.now() + 3600000) }),
    },
  },
}));

describe('supervisor-rules.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRulesCache();
  });

  describe('getEffectiveRules', () => {
    it('returns default rules when DB is empty and seed runs', async () => {
      const rules = await getEffectiveRules();
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every(r => r.id && r.type && r.enabled !== undefined)).toBe(true);
    });

    it('returns rules from DB when populated', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.supervisorRuleVersion.count).mockResolvedValue(7);
      vi.mocked(prisma.supervisorRuleVersion.findMany).mockResolvedValue([
        {
          id: 'v1',
          ruleId: 'max-position',
          type: 'MAX_POSITION_SIZE',
          params: { maxPercent: 15 },
          enabled: true,
          description: 'Test',
          effectiveAt: new Date(0),
          createdAt: new Date(),
        },
      ]);

      const rules = await getEffectiveRules();
      expect(rules.length).toBe(1);
      expect(rules[0].id).toBe('max-position');
      expect(rules[0].params).toEqual({ maxPercent: 15 });
    });
  });

  describe('updateRule', () => {
    it('schedules rule update with delay', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.supervisorRuleVersion.count).mockResolvedValue(7);
      vi.mocked(prisma.supervisorRuleVersion.findMany).mockResolvedValue([
        {
          id: 'v1',
          ruleId: 'max-position',
          type: 'MAX_POSITION_SIZE',
          params: { maxPercent: 10 },
          enabled: true,
          description: 'Original',
          effectiveAt: new Date(0),
          createdAt: new Date(),
        },
      ]);

      const result = await updateRule('max-position', { enabled: false });
      expect(result.effectiveAt.getTime()).toBeGreaterThan(Date.now());
      expect(prisma.supervisorRuleVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ruleId: 'max-position',
            enabled: false,
          }),
        })
      );
    });

    it('throws when rule not found', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.supervisorRuleVersion.count).mockResolvedValue(7);
      vi.mocked(prisma.supervisorRuleVersion.findMany).mockResolvedValue([
        {
          id: 'v1',
          ruleId: 'other-rule',
          type: 'MAX_POSITION_SIZE',
          params: {},
          enabled: true,
          description: '',
          effectiveAt: new Date(0),
          createdAt: new Date(),
        },
      ]);

      await expect(updateRule('nonexistent', { enabled: false })).rejects.toThrow(
        'Rule not found'
      );
    });
  });

  describe('evaluateWithDbRules', () => {
    it('evaluates trade request with effective rules', async () => {
      const decision = await evaluateWithDbRules({
        agentId: 'agent1',
        action: 'BUY',
        tokenAddress: 'addr',
        tokenSymbol: 'TKN',
        amountSol: 100,
        portfolioValueSol: 1000,
        tokenLiquidity: 100000,
        tokenMarketCap: 500000,
        dailyTradeCount: 5,
      });
      expect(decision.approved).toBeDefined();
      expect(decision.violations).toBeDefined();
      expect(Array.isArray(decision.violations)).toBe(true);
    });
  });
});
