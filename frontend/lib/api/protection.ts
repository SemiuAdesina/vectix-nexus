'use client';

import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';

export interface WhitelistStatus {
  agentId: string;
  whitelistedWallet: string | null;
  isLocked: boolean;
  lockedUntil: string | null;
  canWithdraw: boolean;
}

export interface AffiliateStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayouts: number;
}

export interface TurboFees {
  userFee: number;
  validatorTip: number;
  profit: number;
}

const API_BASE = getBackendUrl();

export async function getWhitelistStatus(agentId: string): Promise<WhitelistStatus | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.agents.whitelist(agentId)}`, { headers });
  const data = await res.json();
  return data.success ? data : null;
}

export async function setWhitelistedWallet(agentId: string, walletAddress: string): Promise<{
  success: boolean;
  lockedUntil?: string;
  message?: string;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.agents.whitelist(agentId)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ walletAddress }),
  });
  return res.json();
}

export async function getAffiliateStats(userId: string): Promise<AffiliateStats | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.affiliate.stats(userId)}`, { headers });
  const data = await res.json();
  return data.success ? data : null;
}

export async function generateReferralCode(userId: string): Promise<string | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.affiliate.generateCode}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  return data.success ? data.referralCode : null;
}

export async function applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.affiliate.applyCode}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, referralCode }),
  });
  const data = await res.json();
  return data.success;
}

export async function toggleMevProtection(agentId: string, enabled: boolean): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.agents.mevProtection(agentId)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ enabled }),
  });
  const data = await res.json();
  return data.success;
}

export async function getTurboFees(): Promise<TurboFees> {
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.turbo.fees}`);
  const data = await res.json();
  return data;
}

export async function checkSanctions(walletAddress: string): Promise<{
  isSanctioned: boolean;
  riskLevel: string;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.security.sanctions}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ walletAddress }),
  });
  return res.json();
}
