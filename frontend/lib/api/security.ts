'use client';

import { getApiBaseUrl } from './config';

const API_BASE = getApiBaseUrl();

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

export async function analyzeToken(tokenAddress: string): Promise<{
  report: SecurityReport;
  trustScore: TrustScore;
} | null> {
  const res = await fetch(`${API_BASE}/api/security/analyze/${tokenAddress}`);
  const data = await res.json();
  return data.success ? { report: data.report, trustScore: data.trustScore } : null;
}

export async function checkTradeSafety(tokenAddress: string, safetyMode = true): Promise<{
  approved: boolean;
  reason: string;
  trustScore: number;
  trustGrade: string;
}> {
  const res = await fetch(`${API_BASE}/api/security/check-trade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress, safetyMode }),
  });
  const data = await res.json();
  return data;
}

export async function getSafeTrending(minScore = 70): Promise<SafeToken[]> {
  const res = await fetch(`${API_BASE}/api/security/trending/safe?minScore=${minScore}`);
  const data = await res.json();
  return data.tokens || [];
}

export async function getAllTrending(): Promise<SafeToken[]> {
  const res = await fetch(`${API_BASE}/api/security/trending`);
  const data = await res.json();
  return data.tokens || [];
}

