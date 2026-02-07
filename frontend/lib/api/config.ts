function isLocalOrigin(origin: string): boolean {
  return origin.includes('localhost') || origin.includes('127.0.0.1');
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (typeof window !== 'undefined') {
    if (isLocalOrigin(window.location?.origin ?? '')) {
      return fromEnv || 'http://localhost:3002';
    }
    return fromEnv && !fromEnv.includes('localhost') ? fromEnv : '';
  }

  return fromEnv || 'http://localhost:3002';
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

export const API_ENDPOINTS = {
  agents: {
    list: '/api/agents',
    detail: (id: string) => `/api/agents/${id}`,
    status: (id: string) => `/api/agents/${id}/status`,
    logs: (id: string) => `/api/agents/${id}/logs`,
    start: (id: string) => `/api/agents/${id}/start`,
    stop: (id: string) => `/api/agents/${id}/stop`,
    restart: (id: string) => `/api/agents/${id}/restart`,
    balance: (id: string) => `/api/agents/${id}/balance`,
    withdrawRequest: (id: string) => `/api/agents/${id}/withdraw/request`,
    withdrawConfirm: (id: string) => `/api/agents/${id}/withdraw/confirm`,
    launchToken: (id: string) => `/api/agents/${id}/launch-token`,
    whitelist: (id: string) => `/api/agent/${id}/whitelist`,
    mevProtection: (id: string) => `/api/agent/${id}/mev-protection`,
  },
  auth: {
    user: '/api/user',
    wallet: '/api/user/wallet',
  },
  apiKeys: {
    list: '/api/api-keys',
    detail: (id: string) => `/api/api-keys/${id}`,
    config: '/api/api-keys/config',
  },
  webhooks: {
    list: '/api/webhooks',
    detail: (id: string) => `/api/webhooks/${id}`,
  },
  marketplace: {
    strategies: '/api/marketplace/strategies',
    strategyDetail: (id: string) => `/api/marketplace/strategies/${id}`,
    purchase: (id: string) => `/api/marketplace/strategies/${id}/purchase`,
    purchased: '/api/marketplace/purchased',
  },
  subscription: {
    status: '/api/subscription/status',
    checkout: '/api/stripe/create-checkout',
    billingPortal: '/api/stripe/billing-portal',
    pricing: '/api/pricing',
  },
  security: {
    analyze: (address: string) => `/api/security/analyze/${address}`,
    checkTrade: '/api/security/check-trade',
    trendingSafe: '/api/security/trending/safe',
    trending: '/api/security/trending',
    sanctions: '/api/sanctions/check',
  },
  preflight: {
    stats: (agentId: string) => `/api/preflight/stats/${agentId}`,
  },
  supervisor: {
    rules: '/api/supervisor/rules',
    ruleDetail: (id: string) => `/api/supervisor/rules/${id}`,
    evaluate: '/api/supervisor/evaluate',
  },
  shadow: {
    create: '/api/shadow/create',
    report: (agentId: string) => `/api/shadow/report/${agentId}`,
    stop: (agentId: string) => `/api/shadow/stop/${agentId}`,
    updatePrices: (agentId: string) => `/api/shadow/update-prices/${agentId}`,
  },
  tee: {
    status: '/api/tee/status',
    storeKey: '/api/tee/store-key',
  },
  narrative: {
    status: '/api/narrative/status',
    clusters: '/api/narrative/clusters',
    signals: '/api/narrative/signals',
  },
  affiliate: {
    stats: (userId: string) => `/api/affiliate/stats/${userId}`,
    generateCode: '/api/affiliate/generate-code',
    applyCode: '/api/affiliate/apply-code',
  },
  turbo: {
    fees: '/api/turbo/fees',
  },
  deploy: '/api/deploy-agent',
  publicApi: {
    trade: (agentId: string) => `/v1/agents/${agentId}/trade`,
    trending: '/v1/market/trending',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
