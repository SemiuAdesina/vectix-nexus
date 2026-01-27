import { getApiBaseUrl } from '@/lib/api/config';
import type { AuditTrailEntry } from '../onchain/types';

const API_BASE = getApiBaseUrl();

export async function getAuditTrail(query: { agentId?: string; tokenAddress?: string; decision?: string; startDate?: string; endDate?: string; offset?: number; limit?: number }): Promise<{ success: boolean; entries: AuditTrailEntry[]; total: number }> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
  const res = await fetch(`${API_BASE}/api/onchain/audit-trail?${params}`);
  return res.json();
}

export async function verifyAuditTrail(): Promise<{ success: boolean; valid: boolean; invalidEntries: string[] }> {
  const res = await fetch(`${API_BASE}/api/onchain/audit-trail/verify`);
  return res.json();
}

export async function exportAuditTrail(format: 'json' | 'csv'): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/onchain/audit-trail/export?format=${format}`);
  return res.blob();
}
