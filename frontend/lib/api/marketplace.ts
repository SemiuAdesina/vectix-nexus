import { getApiBaseUrl } from './config';
import { getAuthHeaders } from './auth';

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

function marketplaceBase(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api` : '/api';
}

export async function getStrategies(options?: { category?: string; featured?: boolean }): Promise<Strategy[]> {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.featured) params.append('featured', 'true');

  try {
    const response = await fetch(`${marketplaceBase()}/marketplace/strategies?${params}`, {
      headers: await getAuthHeaders(),
    });
    const data = await response.json();
    return data.strategies || [];
  } catch {
    return [];
  }
}

export async function getStrategy(id: string): Promise<Strategy | null> {
  try {
    const response = await fetch(`${marketplaceBase()}/marketplace/strategies/${id}`, {
      headers: await getAuthHeaders(),
    });
    const data = await response.json();
    return data.strategy || null;
  } catch {
    return null;
  }
}

export async function getPurchasedStrategies(): Promise<Strategy[]> {
  try {
    const response = await fetch(`${marketplaceBase()}/marketplace/purchased`, {
      headers: await getAuthHeaders(),
    });
    const data = await response.json();
    return data.strategies || [];
  } catch {
    return [];
  }
}

export interface PurchaseResult {
  success: boolean;
  alreadyOwned?: boolean;
  requiresPayment?: boolean;
  checkoutUrl?: string;
  error?: string;
}

export async function purchaseStrategy(id: string): Promise<PurchaseResult> {
  const response = await fetch(`${marketplaceBase()}/marketplace/strategies/${id}/purchase`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  return response.json();
}

