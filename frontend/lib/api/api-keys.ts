import { getApiBaseUrl } from './config';
import { getAuthHeaders } from './auth';

function apiKeysBase(): string {
  const base = getApiBaseUrl();
  return base || '';
}

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
  const url = apiKeysBase() ? `${apiKeysBase()}/api/api-keys` : '/api/api-keys';
  const res = await fetch(url, { headers, credentials: 'include' });
  const data = await res.json();
  return data.keys || [];
}

function authHeaders(token?: string | null): Promise<Record<string, string>> {
  if (token) {
    return Promise.resolve({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
  return getAuthHeaders();
}

export async function createApiKey(
  name: string,
  scopes: ApiScope[],
  token?: string | null
): Promise<{ key: string; data: ApiKeyData }> {
  const headers = await authHeaders(token);
  const url = apiKeysBase() ? `${apiKeysBase()}/api/api-keys` : '/api/api-keys';
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, scopes }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data as { error?: string })?.error ?? `Failed to create API key (${res.status})`;
    throw new Error(msg);
  }
  return data as { key: string; data: ApiKeyData };
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const url = apiKeysBase() ? `${apiKeysBase()}/api/api-keys/${keyId}` : `/api/api-keys/${keyId}`;
  const res = await fetch(url, { method: 'DELETE', headers, credentials: 'include' });
  return res.ok;
}

export async function getApiConfig(): Promise<ApiConfig> {
  const url = apiKeysBase() ? `${apiKeysBase()}/api/api-keys/config` : '/api/api-keys/config';
  const res = await fetch(url);
  return res.json();
}

export async function getWebhooks(): Promise<WebhookData[]> {
  const headers = await getAuthHeaders();
  const url = apiKeysBase() ? `${apiKeysBase()}/api/webhooks` : '/api/webhooks';
  const res = await fetch(url, { headers, credentials: 'include' });
  const data = await res.json();
  return data.webhooks || [];
}

export async function createWebhook(url: string, events: string[]): Promise<WebhookData> {
  const headers = await getAuthHeaders();
  const baseUrl = apiKeysBase() ? `${apiKeysBase()}/api/webhooks` : '/api/webhooks';
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, events }),
    credentials: 'include',
  });
  return res.json();
}

export async function deleteWebhook(webhookId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const baseUrl = apiKeysBase() ? `${apiKeysBase()}/api/webhooks/${webhookId}` : `/api/webhooks/${webhookId}`;
  const res = await fetch(baseUrl, { method: 'DELETE', headers, credentials: 'include' });
  return res.ok;
}

