import { getApiBaseUrl } from '@/lib/api/config';
import type { CircuitBreakerState, CircuitBreakerConfig } from './types';

const API_BASE = getApiBaseUrl();

export interface CircuitBreakerMetrics {
  volume?: number;
  priceChange?: number;
  tradeCount?: number;
}

export async function initializeCircuitBreaker(agentId: string, config: CircuitBreakerConfig): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/onchain/circuit-breaker/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, config }),
  });
  return res.json();
}

export async function checkCircuitBreaker(agentId: string, metrics: CircuitBreakerMetrics): Promise<{ success: boolean; allowed: boolean; reason?: string }> {
  const res = await fetch(`${API_BASE}/api/onchain/circuit-breaker/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, metrics }),
  });
  return res.json();
}

export async function getCircuitBreakerState(agentId: string): Promise<{ success: boolean; state: CircuitBreakerState | null }> {
  const res = await fetch(`${API_BASE}/api/onchain/circuit-breaker/state/${agentId}`);
  return res.json();
}

export async function resetCircuitBreaker(agentId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/onchain/circuit-breaker/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId }),
  });
  return res.json();
}
