import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./prisma', () => ({
    prisma: {
        subscription: { findFirst: vi.fn() }
    }
}));

vi.mock('../services/stripe', () => ({
    PRICING_PLANS: {
        pro: { name: 'Pro Plan' },
        enterprise: { name: 'Enterprise Plan' }
    }
}));

import { prisma } from './prisma';
import { checkSubscriptionStatus, requireActiveSubscription } from './subscription';

describe('subscription', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('checkSubscriptionStatus', () => {
        it('returns hasActiveSubscription false when no subscription', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
            const result = await checkSubscriptionStatus('user-123');
            expect(result.hasActiveSubscription).toBe(false);
        });

        it('returns subscription details when active', async () => {
            const mockSub = {
                id: 'sub-1',
                plan: 'pro',
                status: 'active',
                stripeSubscriptionId: 'stripe-sub-1',
                currentPeriodEnd: new Date('2025-12-31')
            };
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSub as any);
            const result = await checkSubscriptionStatus('user-123');
            expect(result.hasActiveSubscription).toBe(true);
            expect(result.plan).toBe('pro');
            expect(result.planName).toBe('Pro Plan');
        });

        it('returns hasActiveSubscription false for past_due status', async () => {
            const mockSub = { id: 'sub-1', plan: 'pro', status: 'past_due' };
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSub as any);
            const result = await checkSubscriptionStatus('user-123');
            expect(result.hasActiveSubscription).toBe(false);
        });
    });

    describe('requireActiveSubscription', () => {
        it('throws error when no active subscription in production', async () => {
            vi.stubEnv('NODE_ENV', 'production');
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
            await expect(requireActiveSubscription('user-123')).rejects.toThrow('Active subscription required');
        });

        it('throws error in dev mode without subscription', async () => {
            vi.stubEnv('NODE_ENV', 'development');
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
            await expect(requireActiveSubscription('user-123')).rejects.toThrow('Active subscription required');
        });

        it('passes when subscription is active', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue({ status: 'active' } as any);
            await expect(requireActiveSubscription('user-123')).resolves.toBeUndefined();
        });
    });
});
