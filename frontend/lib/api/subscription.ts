import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';
import type { SubscriptionStatus, PricingPlan } from './types';

const BACKEND_URL = getBackendUrl();

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.subscription.status}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch subscription status: ${response.status}`);
  return response.json() as Promise<SubscriptionStatus>;
}

export async function createCheckoutSession(plan: 'hobby' | 'pro'): Promise<string> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.subscription.checkout}`, {
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
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.subscription.pricing}`);
  if (!response.ok) throw new Error(`Failed to fetch pricing: ${response.status}`);
  const data = (await response.json()) as { plans: Record<string, PricingPlan> };
  return data.plans;
}

export async function openBillingPortal(): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.subscription.billingPortal}`, {
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
