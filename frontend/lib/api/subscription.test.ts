import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as subscription from './subscription';
import * as auth from './auth';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn(),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  API_ENDPOINTS: {
    subscription: {
      status: '/api/subscription/status',
      checkout: '/api/stripe/create-checkout',
      pricing: '/api/pricing',
      billingPortal: '/api/stripe/billing-portal',
    },
  },
}));

describe('subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.getAuthHeaders).mockResolvedValue({ 'Content-Type': 'application/json' });
  });

  describe('getSubscriptionStatus', () => {
    it('returns default when no token', async () => {
      vi.mocked(auth.getAuthHeaders).mockResolvedValue({ 'Content-Type': 'application/json' });
      const status = await subscription.getSubscriptionStatus();
      expect(status).toEqual({ hasActiveSubscription: false });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches subscription status when token present', async () => {
      vi.mocked(auth.getAuthHeaders).mockResolvedValue({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      });
      const mockStatus = { hasActiveSubscription: true, plan: 'pro', currentPeriodEnd: new Date().toISOString() };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const status = await subscription.getSubscriptionStatus();
      expect(status).toEqual(mockStatus);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('returns default status on failure', async () => {
      vi.mocked(auth.getAuthHeaders).mockResolvedValue({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      });
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const status = await subscription.getSubscriptionStatus();
      expect(status).toEqual({ hasActiveSubscription: false });
    });
  });

  describe('createCheckoutSession', () => {
    it('creates checkout session', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session123' }),
      } as Response);

      const url = await subscription.createCheckoutSession('pro');
      expect(url).toBe('https://checkout.stripe.com/session123');
    });
  });

  describe('getPricingPlans', () => {
    it('fetches pricing plans', async () => {
      const mockPlans = {
        free: { name: 'Free', price: 0 },
        pro: { name: 'Pro', price: 29 },
      };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ plans: mockPlans }),
      } as Response);

      const plans = await subscription.getPricingPlans();
      expect(plans).toEqual(mockPlans);
    });
  });

  describe('openBillingPortal', () => {
    it('opens billing portal', async () => {
      const mockUrl = 'https://billing.stripe.com/portal123';
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: mockUrl }),
      } as Response);

      await expect(subscription.openBillingPortal()).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
