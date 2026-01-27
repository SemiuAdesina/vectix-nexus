'use client';

import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';

export interface RiskItem {
  id: string;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  passed: boolean;
  message: string;
}

export interface TrustScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  risks: RiskItem[];
  passed: RiskItem[];
}

export interface SecurityReport {
  tokenAddress: string;
  isHoneypot: boolean;
  isMintable: boolean;
  liquidityUsd: number;
  liquidityLockedPercent: number;
  contractRenounced: boolean;
  top10HoldersPercent: number;
  tokenAgeHours: number;
  buyTax: number;
  sellTax: number;
}

export interface SafeToken {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidityUsd: number;
  trustScore: number;
  trustGrade: string;
  marketCap: number;
}

const API_BASE = getBackendUrl();

export async function analyzeToken(tokenAddress: string): Promise<{
  report: SecurityReport;
  trustScore: TrustScore;
} | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.security.analyze(tokenAddress)}`, { headers });
  const data = await res.json();
  return data.success ? { report: data.report, trustScore: data.trustScore } : null;
}

export async function checkTradeSafety(tokenAddress: string, safetyMode = true): Promise<{
  approved: boolean;
  reason: string;
  trustScore: number;
  trustGrade: string;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.security.checkTrade}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tokenAddress, safetyMode }),
  });
  const data = await res.json();
  return data;
}

export async function getSafeTrending(minScore = 70): Promise<SafeToken[]> {
  try {
    const url = `${API_BASE}${API_ENDPOINTS.security.trendingSafe}?minScore=${minScore}`;
    console.log('[getSafeTrending] Fetching from:', url);
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error('[getSafeTrending] Response not OK:', res.status, res.statusText);
      throw new Error(`Failed to fetch safe trending: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('[getSafeTrending] Response:', { 
      success: data.success, 
      tokenCount: data.tokens?.length || 0,
      filters: data.filters,
      hasTokens: !!data.tokens,
      tokensType: Array.isArray(data.tokens) ? 'array' : typeof data.tokens
    });
    if (!data.success) {
      console.warn('[getSafeTrending] API returned success: false', data);
    }
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (error) {
    console.error('[getSafeTrending] Error:', error);
    throw error;
  }
}

export async function getAllTrending(): Promise<SafeToken[]> {
  try {
    const url = `${API_BASE}${API_ENDPOINTS.security.trending}`;
    console.log('[getAllTrending] Fetching from:', url);
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error('[getAllTrending] Response not OK:', res.status, res.statusText);
      throw new Error(`Failed to fetch trending: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('[getAllTrending] Response:', { 
      success: data.success, 
      tokenCount: data.tokens?.length || 0,
      hasTokens: !!data.tokens,
      tokensType: Array.isArray(data.tokens) ? 'array' : typeof data.tokens
    });
    if (!data.success) {
      console.warn('[getAllTrending] API returned success: false', data);
    }
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (error) {
    console.error('[getAllTrending] Error:', error);
    throw error;
  }
}
