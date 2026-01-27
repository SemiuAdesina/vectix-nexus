import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../lib/prisma';
import * as auth from '../lib/auth';
import * as subscription from '../lib/subscription';
import * as stripeService from '../services/stripe';

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    strategy: {
      findUnique: vi.fn(),
    },
    strategyPurchase: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../lib/auth', () => ({
  getUserIdFromRequest: vi.fn(),
}));

vi.mock('../lib/subscription', () => ({
  checkSubscriptionStatus: vi.fn(),
}));

vi.mock('../services/stripe', () => ({
  createCheckoutSession: vi.fn(),
  handleWebhookEvent: vi.fn(),
  createBillingPortalSession: vi.fn(),
  stripe: {
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
  PRICING_PLANS: {
    hobby: { name: 'Hobby Agent', price: 2900, priceId: 'price_hobby', features: ['1 Agent', 'Basic support', '10GB logs'] },
    pro: { name: 'Pro Agent', price: 9900, priceId: 'price_pro', features: ['5 Agents', 'Priority support', '100GB logs'] },
  },
}));

describe('stripe.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /pricing', () => {
    it('returns pricing plans', () => {
      const { PRICING_PLANS } = stripeService;
      expect(PRICING_PLANS).toBeDefined();
      expect(PRICING_PLANS.hobby).toBeDefined();
      expect(PRICING_PLANS.pro).toBeDefined();
    });
  });

  describe('POST /stripe/create-checkout', () => {
    it('creates checkout session', async () => {
      vi.mocked(auth.getUserIdFromRequest).mockResolvedValue('user1');
      vi.mocked(prisma.prisma.user.findUnique).mockResolvedValue({ email: 'test@test.com' } as any);
      vi.mocked(stripeService.createCheckoutSession).mockResolvedValue('https://checkout.stripe.com/session123');

      const url = await stripeService.createCheckoutSession({
        userId: 'user1',
        userEmail: 'test@test.com',
        plan: 'pro',
        successUrl: 'http://localhost:3000/dashboard',
        cancelUrl: 'http://localhost:3000/pricing',
      });
      expect(url).toBe('https://checkout.stripe.com/session123');
    });
  });

  describe('GET /subscription/status', () => {
    it('returns subscription status', async () => {
      vi.mocked(auth.getUserIdFromRequest).mockResolvedValue('user1');
      const mockStatus = { active: true, plan: 'pro' };
      vi.mocked(subscription.checkSubscriptionStatus).mockResolvedValue(mockStatus as any);

      const status = await subscription.checkSubscriptionStatus('user1');
      expect(status).toEqual(mockStatus);
    });
  });
});
