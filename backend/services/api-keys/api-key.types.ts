export type ApiScope = 
  | 'read:agents'
  | 'read:logs'
  | 'read:market'
  | 'write:control'
  | 'write:trade';

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

export interface CreateApiKeyRequest {
  name: string;
  scopes: ApiScope[];
}

export interface CreateApiKeyResponse {
  key: string;
  data: ApiKeyData;
}

export interface RateLimitConfig {
  free: { daily: number; perMinute: number };
  pro: { daily: number; perMinute: number };
}

export const RATE_LIMITS: RateLimitConfig = {
  free: { daily: 100, perMinute: 10 },
  pro: { daily: 10000, perMinute: 100 },
};

export const SCOPE_DESCRIPTIONS: Record<ApiScope, string> = {
  'read:agents': 'View agent status and configuration',
  'read:logs': 'Access agent logs',
  'read:market': 'Access market data and analysis',
  'write:control': 'Start, stop, and restart agents',
  'write:trade': 'Execute trades (requires Pro)',
};

export const FREE_TIER_SCOPES: ApiScope[] = ['read:agents', 'read:logs', 'read:market'];
export const PRO_TIER_SCOPES: ApiScope[] = [...FREE_TIER_SCOPES, 'write:control', 'write:trade'];

