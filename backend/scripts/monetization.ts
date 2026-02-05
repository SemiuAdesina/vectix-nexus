import dotenv from 'dotenv';
import { stripe, isStripeConfigured } from '../services/stripe/stripe.config';
import { prisma } from '../lib/prisma';

dotenv.config();

export interface TreasurySummary {
  stripeConfigured: boolean;
  balanceAvailableUsd: number;
  balancePendingUsd: number;
  paidInvoicesUsd: number;
  paidInvoiceCount: number;
  activeSubscriptions: number;
  strategyRevenueUsd: number;
}

export async function getTreasurySummary(): Promise<TreasurySummary> {
  const result: TreasurySummary = {
    stripeConfigured: isStripeConfigured,
    balanceAvailableUsd: 0,
    balancePendingUsd: 0,
    paidInvoicesUsd: 0,
    paidInvoiceCount: 0,
    activeSubscriptions: 0,
    strategyRevenueUsd: 0,
  };

  if (stripe) {
    const balance = await stripe.balance.retrieve();
    const availableUsd = balance.available.find((b) => b.currency === 'usd');
    const pendingUsd = balance.pending.find((b) => b.currency === 'usd');
    result.balanceAvailableUsd = (availableUsd?.amount ?? 0) / 100;
    result.balancePendingUsd = (pendingUsd?.amount ?? 0) / 100;

    let totalPaidCents = 0;
    for await (const inv of stripe.invoices.list({ status: 'paid', limit: 100 })) {
      result.paidInvoiceCount += 1;
      totalPaidCents += inv.amount_paid;
    }
    result.paidInvoicesUsd = totalPaidCents / 100;
  }

  const activeSubs = await prisma.subscription.count({ where: { status: 'active' } });
  result.activeSubscriptions = activeSubs;

  const purchases = await prisma.strategyPurchase.aggregate({ _sum: { pricePaid: true } });
  result.strategyRevenueUsd = (purchases._sum.pricePaid ?? 0) / 100;

  return result;
}

export function formatTreasuryReport(summary: TreasurySummary): string {
  const lines: string[] = [
    '--- Vectix Foundry Treasury (Subscription & Revenue) ---',
    `Stripe configured: ${summary.stripeConfigured}`,
    `Stripe balance (available): $${summary.balanceAvailableUsd.toFixed(2)}`,
    `Stripe balance (pending):   $${summary.balancePendingUsd.toFixed(2)}`,
    `Paid invoices (Stripe):     $${summary.paidInvoicesUsd.toFixed(2)} (${summary.paidInvoiceCount} invoices)`,
    `Active subscriptions:       ${summary.activeSubscriptions}`,
    `Strategy purchases (DB):    $${summary.strategyRevenueUsd.toFixed(2)}`,
    '--------------------------------------------------------',
  ];
  return lines.join('\n');
}

async function main(): Promise<void> {
  const summary = await getTreasurySummary();
  console.log(formatTreasuryReport(summary));
  const hasRevenue =
    summary.balanceAvailableUsd > 0 ||
    summary.paidInvoicesUsd > 0 ||
    summary.strategyRevenueUsd > 0;
  if (hasRevenue) {
    console.log('Treasury has received subscription/purchase revenue.');
  } else if (!summary.stripeConfigured) {
    console.log('Stripe not configured. Set STRIPE_SECRET_KEY to check live revenue.');
  } else {
    console.log('No paid revenue recorded yet.');
  }
}

const isEntry =
  typeof require !== 'undefined' && require.main === module;
if (isEntry) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
