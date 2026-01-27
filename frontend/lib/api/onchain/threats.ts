import { getApiBaseUrl } from '@/lib/api/config';
import type { ThreatIntelligence, ThreatReport } from '../onchain/types';

const API_BASE = getApiBaseUrl();

export async function detectThreat(metrics: { volume?: number; priceChange?: number; tradeCount?: number; tokenAddress?: string }): Promise<{ success: boolean; isAnomaly: boolean; confidence: number; reason: string }> {
  const res = await fetch(`${API_BASE}/api/onchain/threats/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  });
  return res.json();
}

export async function getThreatFeed(limit?: number): Promise<{ success: boolean; threats: ThreatIntelligence[] }> {
  const params = limit ? `?limit=${limit}` : '';
  const res = await fetch(`${API_BASE}/api/onchain/threats/feed${params}`);
  return res.json();
}

export async function reportThreat(report: Omit<ThreatReport, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; report: ThreatReport }> {
  const res = await fetch(`${API_BASE}/api/onchain/threats/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  return res.json();
}
