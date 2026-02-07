'use client';

import { getApiBaseUrl } from './config';

const API_BASE = getApiBaseUrl();

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

export async function getWhitelistStatus(agentId: string): Promise<WhitelistStatus | null> {
  const res = await fetch(`${API_BASE}/api/agent/${agentId}/whitelist`);
  const data = await res.json();
  return data.success ? data : null;
}

export async function setWhitelistedWallet(agentId: string, walletAddress: string): Promise<{
  success: boolean;
  lockedUntil?: string;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/api/agent/${agentId}/whitelist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  return res.json();
}

export async function getAffiliateStats(userId: string): Promise<AffiliateStats | null> {
  const res = await fetch(`${API_BASE}/api/affiliate/stats/${userId}`);
  const data = await res.json();
  return data.success ? data : null;
}

export async function generateReferralCode(userId: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/api/affiliate/generate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  return data.success ? data.referralCode : null;
}

export async function applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/affiliate/apply-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, referralCode }),
  });
  const data = await res.json();
  return data.success;
}

export async function toggleMevProtection(agentId: string, enabled: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/agent/${agentId}/mev-protection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  const data = await res.json();
  return data.success;
}

export async function getTurboFees(): Promise<TurboFees> {
  const res = await fetch(`${API_BASE}/api/turbo/fees`);
  const data = await res.json();
  return data;
}

export async function checkSanctions(walletAddress: string): Promise<{
  isSanctioned: boolean;
  riskLevel: string;
}> {
  const res = await fetch(`${API_BASE}/api/sanctions/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  return res.json();
}

