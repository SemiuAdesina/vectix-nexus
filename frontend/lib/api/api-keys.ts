import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';

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

const API_BASE = getBackendUrl();

export async function getApiKeys(): Promise<ApiKeyData[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.apiKeys.list}`, { headers });
  const data = await res.json();
  return data.keys || [];
}

export async function createApiKey(name: string, scopes: ApiScope[]): Promise<{ key: string; data: ApiKeyData }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.apiKeys.list}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, scopes }),
  });
  return res.json();
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.apiKeys.detail(keyId)}`, {
    method: 'DELETE',
    headers,
  });
  return res.ok;
}

export async function getApiConfig(): Promise<ApiConfig> {
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.apiKeys.config}`);
  return res.json();
}

export async function getWebhooks(): Promise<WebhookData[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.webhooks.list}`, { headers });
  const data = await res.json();
  return data.webhooks || [];
}

export async function createWebhook(url: string, events: string[]): Promise<WebhookData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.webhooks.list}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, events }),
  });
  return res.json();
}

export async function deleteWebhook(webhookId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.webhooks.detail(webhookId)}`, {
    method: 'DELETE',
    headers,
  });
  return res.ok;
}
