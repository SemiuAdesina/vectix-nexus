import { getApiBaseUrl } from '@/lib/api/config';
import type { SecurityScanResult, SecurityAlert } from '../onchain/types';

const API_BASE = getApiBaseUrl();

export async function scanToken(tokenAddress: string): Promise<{ success: boolean; result: SecurityScanResult }> {
  const res = await fetch(`${API_BASE}/api/onchain/security/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress }),
  });
  return res.json();
}

export async function getSecurityAlerts(filters?: { severity?: string; tokenAddress?: string; limit?: number }): Promise<{ success: boolean; alerts: SecurityAlert[] }> {
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
  const res = await fetch(`${API_BASE}/api/onchain/security/alerts?${params}`);
  return res.json();
}
