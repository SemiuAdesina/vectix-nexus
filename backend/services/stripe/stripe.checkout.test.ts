import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./stripe.config', () => ({
  stripe: null,
  PRICING_PLANS: {
    hobby: { name: 'Hobby', price: 2900, priceId: 'price_hobby', features: [] },
    pro: { name: 'Pro', price: 9900, priceId: 'price_pro', features: [] },
  },
}));

import { createCheckoutSession, createStrategyCheckout, createBillingPortalSession } from './stripe.checkout';

describe('createCheckoutSession', () => {
  it('throws error when stripe is not configured', async () => {
    await expect(
      createCheckoutSession({
        userId: 'user-123',
        userEmail: 'test@example.com',
        plan: 'hobby',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      })
    ).rejects.toThrow('Stripe not configured');
  });
});

describe('createStrategyCheckout', () => {
  it('throws error when stripe is not configured', async () => {
    await expect(
      createStrategyCheckout({
        userId: 'user-123',
        userEmail: 'test@example.com',
        strategyId: 'strat-123',
        strategyName: 'Test Strategy',
        priceUsd: 1000,
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      })
    ).rejects.toThrow('Stripe not configured');
  });
});

describe('createBillingPortalSession', () => {
  it('throws error when stripe is not configured', async () => {
    await expect(
      createBillingPortalSession('cus_123', 'http://localhost/return')
    ).rejects.toThrow('Stripe not configured');
  });
});
