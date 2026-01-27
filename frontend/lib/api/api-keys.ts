import { getAuthHeaders } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export type ApiScope = 'read:agents' | 'read:logs' | 'read:market' | 'write:control' | 'write:trade';
export type ApiTier = 'free' | 'pro';

export interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: ApiScope[];
  tier: ApiTier;
  requestCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface WebhookData {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  secret?: string;
}

export interface ApiConfig {
  scopes: Record<ApiScope, string>;
  tiers: { free: ApiScope[]; pro: ApiScope[] };
  rateLimits: { free: { daily: number; perMinute: number }; pro: { daily: number; perMinute: number } };
}

export async function getApiKeys(): Promise<ApiKeyData[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/api-keys`, { headers });
  const data = await res.json();
  return data.keys || [];
}

export async function createApiKey(name: string, scopes: ApiScope[]): Promise<{ key: string; data: ApiKeyData }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/api-keys`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, scopes }),
  });
  return res.json();
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/api-keys/${keyId}`, {
    method: 'DELETE',
    headers,
  });
  return res.ok;
}

export async function getApiConfig(): Promise<ApiConfig> {
  const res = await fetch(`${API_BASE}/api/api-keys/config`);
  return res.json();
}

export async function getWebhooks(): Promise<WebhookData[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/webhooks`, { headers });
  const data = await res.json();
  return data.webhooks || [];
}

export async function createWebhook(url: string, events: string[]): Promise<WebhookData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/webhooks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, events }),
  });
  return res.json();
}

export async function deleteWebhook(webhookId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers,
  });
  return res.ok;
}

