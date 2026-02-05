import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTreasurySummary, formatTreasuryReport, type TreasurySummary } from './monetization';
import { prisma } from '../lib/prisma';

vi.mock('../services/stripe/stripe.config', () => ({
  stripe: null,
  isStripeConfigured: false,
}));

vi.mock('../lib/prisma', () => ({
  prisma: {
    subscription: { count: vi.fn().mockResolvedValue(0) },
    strategyPurchase: { aggregate: vi.fn().mockResolvedValue({ _sum: { pricePaid: null } }) },
  },
}));

describe('monetization', () => {
  beforeEach(() => {
    vi.mocked(prisma.subscription.count).mockResolvedValue(0);
    vi.mocked(prisma.strategyPurchase.aggregate).mockResolvedValue({ _sum: { pricePaid: null } });
  });

  describe('getTreasurySummary', () => {
    it('returns subscription and strategy counts from db when Stripe is not configured', async () => {
      vi.mocked(prisma.subscription.count).mockResolvedValue(3);
      vi.mocked(prisma.strategyPurchase.aggregate).mockResolvedValue({ _sum: { pricePaid: 15000 } });

      const summary = await getTreasurySummary();

      expect(summary.stripeConfigured).toBe(false);
      expect(summary.balanceAvailableUsd).toBe(0);
      expect(summary.paidInvoicesUsd).toBe(0);
      expect(summary.activeSubscriptions).toBe(3);
      expect(summary.strategyRevenueUsd).toBe(150);
    });

    it('returns zero strategy revenue when no purchases', async () => {
      const summary = await getTreasurySummary();
      expect(summary.strategyRevenueUsd).toBe(0);
    });
  });

  describe('formatTreasuryReport', () => {
    it('includes all summary fields in output', () => {
      const summary: TreasurySummary = {
        stripeConfigured: true,
        balanceAvailableUsd: 100.5,
        balancePendingUsd: 20,
        paidInvoicesUsd: 500,
        paidInvoiceCount: 5,
        activeSubscriptions: 2,
        strategyRevenueUsd: 49,
      };
      const report = formatTreasuryReport(summary);
      expect(report).toContain('Stripe configured: true');
      expect(report).toContain('$100.50');
      expect(report).toContain('$500.00');
      expect(report).toContain('5 invoices');
      expect(report).toContain('Active subscriptions:       2');
      expect(report).toContain('$49.00');
    });

    it('formats zero values', () => {
      const summary: TreasurySummary = {
        stripeConfigured: false,
        balanceAvailableUsd: 0,
        balancePendingUsd: 0,
        paidInvoicesUsd: 0,
        paidInvoiceCount: 0,
        activeSubscriptions: 0,
        strategyRevenueUsd: 0,
      };
      const report = formatTreasuryReport(summary);
      expect(report).toContain('$0.00');
    });
  });
});
