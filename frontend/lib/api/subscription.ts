import { getAuthHeaders, getBackendUrl } from './auth';
import type { SubscriptionStatus, PricingPlan } from './types';

const BACKEND_URL = getBackendUrl();

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = { hasActiveSubscription: false };

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const headers = await getAuthHeaders();
    if (!headers.Authorization) return DEFAULT_SUBSCRIPTION;
    const base = BACKEND_URL || '';
    const response = await fetch(`${base}/api/subscription/status`, { headers });
    if (!response.ok) return DEFAULT_SUBSCRIPTION;
    return (await response.json()) as SubscriptionStatus;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export async function createCheckoutSession(plan: 'hobby' | 'pro'): Promise<string> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/stripe/create-checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plan }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to create checkout session');
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function getPricingPlans(): Promise<Record<string, PricingPlan>> {
  const response = await fetch(`${BACKEND_URL}/api/pricing`);
  if (!response.ok) throw new Error(`Failed to fetch pricing: ${response.status}`);
  const data = (await response.json()) as { plans: Record<string, PricingPlan> };
  return data.plans;
}

export async function openBillingPortal(): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/stripe/billing-portal`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to open billing portal');
  }

  const data = (await response.json()) as { url: string };
  window.location.href = data.url;
}

