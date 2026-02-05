import { getApiBaseUrl } from '@/lib/api/config';
import type { ThreatIntelligence, ThreatReport } from './types';
import { safeJson } from './safe-json';

const API_BASE = getApiBaseUrl();

export async function detectThreat(metrics: { volume?: number; priceChange?: number; tradeCount?: number; tokenAddress?: string }): Promise<{ success: boolean; isAnomaly: boolean; confidence: number; reason: string }> {
  const res = await fetch(`${API_BASE}/api/onchain/threats/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  });
  try {
    return await safeJson(res);
  } catch {
    return { success: false, isAnomaly: false, confidence: 0, reason: 'Threat API not available' };
  }
}

export async function getThreatFeed(limit?: number): Promise<{ success: boolean; threats: ThreatIntelligence[] }> {
  try {
    const params = limit ? `?limit=${limit}` : '';
    const res = await fetch(`${API_BASE}/api/onchain/threats/feed${params}`);
    const data = await safeJson<{ success: boolean; threats: ThreatIntelligence[] }>(res);
    return data ?? { success: false, threats: [] };
  } catch {
    return { success: false, threats: [] };
  }
}

export async function reportThreat(report: Omit<ThreatReport, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; report: ThreatReport }> {
  const res = await fetch(`${API_BASE}/api/onchain/threats/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  return safeJson(res);
}
