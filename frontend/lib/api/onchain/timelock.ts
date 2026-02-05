import { getApiBaseUrl } from '@/lib/api/config';
import type { TimeLockedTransaction } from './types';
import { safeJson } from './safe-json';

const API_BASE = getApiBaseUrl();

export async function createTimeLock(timelock: Omit<TimeLockedTransaction, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; timelock: TimeLockedTransaction }> {
  const res = await fetch(`${API_BASE}/api/onchain/timelock/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...timelock, executeAt: timelock.executeAt.toISOString() }),
  });
  return safeJson(res);
}

export async function cancelTimeLock(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/onchain/timelock/cancel/${id}`, { method: 'POST' });
  return safeJson(res);
}

export async function getPendingTimeLocks(agentId: string): Promise<{ success: boolean; timelocks: TimeLockedTransaction[] }> {
  const res = await fetch(`${API_BASE}/api/onchain/timelock/pending?agentId=${agentId}`);
  try {
    return await safeJson(res);
  } catch {
    return { success: false, timelocks: [] };
  }
}
