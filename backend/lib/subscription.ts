import { prisma } from './prisma';
import { PRICING_PLANS } from '../services/stripe';

export interface SubscriptionStatusResult {
  hasActiveSubscription: boolean;
  plan?: string;
  planName?: string;
  subscriptionId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  status?: string;
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'past_due'] },
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!subscription) {
    return { hasActiveSubscription: false };
  }

  const planConfig = PRICING_PLANS[subscription.plan as keyof typeof PRICING_PLANS];

  return {
    hasActiveSubscription: subscription.status === 'active',
    plan: subscription.plan,
    planName: planConfig?.name || subscription.plan,
    subscriptionId: subscription.id,
    stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
    status: subscription.status,
  };
}

export async function requireActiveSubscription(userId: string): Promise<void> {
  const subscription = await checkSubscriptionStatus(userId);
  if (!subscription.hasActiveSubscription) {
    throw new Error('Active subscription required. Please upgrade your plan.');
  }
}

