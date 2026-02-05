import { getApiBaseUrl } from '@/lib/api/config';
import { safeJson } from './safe-json';
import type { OnChainLog, VerificationResult } from './types';

export type { VerificationResult };

export interface OnChainStatus {
  success: boolean;
  enabled: boolean;
  message: string;
  programId: string | null;
}

const API_BASE = getApiBaseUrl();

export async function getOnChainStatus(): Promise<OnChainStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/onchain/status`);
    const data = await safeJson<OnChainStatus>(res);
    return data ?? { success: false, enabled: false, message: 'On-chain API not available', programId: null };
  } catch {
    return { success: false, enabled: false, message: 'On-chain API not available', programId: null };
  }
}

export async function storeOnChainLog(log: Omit<OnChainLog, 'onChainProof'>): Promise<OnChainLog> {
  const res = await fetch(`${API_BASE}/api/onchain/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  const data = await safeJson<{ log: OnChainLog }>(res);
  return data.log;
}

export async function verifyOnChainProof(proof: string): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/api/onchain/verify/${encodeURIComponent(proof)}`);
  const data = await safeJson<VerificationResult>(res);
  return data;
}

export * from './circuit-breaker';
export * from './governance';
export * from './audit-trail';
export * from './multisig';
export * from './threats';
export * from './timelock';
export * from './security-scanning';
