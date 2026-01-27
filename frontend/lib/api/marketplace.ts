import { getBackendUrl, getAuthHeaders } from './auth';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  configJson: string;
  category: string;
  icon: string | null;
  featured: boolean;
  verified: boolean;
  purchaseCount: number;
  author: { id: string; name: string | null };
}

export async function getStrategies(options?: { category?: string; featured?: boolean }): Promise<Strategy[]> {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.featured) params.append('featured', 'true');

  const response = await fetch(`${getBackendUrl()}/api/marketplace/strategies?${params}`, {
    headers: await getAuthHeaders(),
  });

  const data = await response.json();
  return data.strategies || [];
}

export async function getStrategy(id: string): Promise<Strategy | null> {
  const response = await fetch(`${getBackendUrl()}/api/marketplace/strategies/${id}`, {
    headers: await getAuthHeaders(),
  });

  const data = await response.json();
  return data.strategy || null;
}

export async function getPurchasedStrategies(): Promise<Strategy[]> {
  const response = await fetch(`${getBackendUrl()}/api/marketplace/purchased`, {
    headers: await getAuthHeaders(),
  });

  const data = await response.json();
  return data.strategies || [];
}

export interface PurchaseResult {
  success: boolean;
  alreadyOwned?: boolean;
  requiresPayment?: boolean;
  checkoutUrl?: string;
  error?: string;
}

export async function purchaseStrategy(id: string): Promise<PurchaseResult> {
  const response = await fetch(`${getBackendUrl()}/api/marketplace/strategies/${id}/purchase`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });

  return response.json();
}

