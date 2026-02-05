import { getApiBaseUrl } from '@/lib/api/config';
import type { AuditTrailEntry } from './types';
import { safeJson } from './safe-json';

const API_BASE = getApiBaseUrl();

export async function getAuditTrail(query: { agentId?: string; tokenAddress?: string; decision?: string; startDate?: string; endDate?: string; offset?: number; limit?: number }): Promise<{ success: boolean; entries: AuditTrailEntry[]; total: number }> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
  const res = await fetch(`${API_BASE}/api/onchain/audit-trail?${params}`);
  try {
    return await safeJson(res);
  } catch {
    return { success: false, entries: [], total: 0 };
  }
}

export async function verifyAuditTrail(): Promise<{ success: boolean; valid: boolean; invalidEntries: string[] }> {
  const res = await fetch(`${API_BASE}/api/onchain/audit-trail/verify`);
  try {
    return await safeJson(res);
  } catch {
    return { success: false, valid: false, invalidEntries: [] };
  }
}

export async function exportAuditTrail(format: 'json' | 'csv'): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/onchain/audit-trail/export?format=${format}`);
  return res.blob();
}
