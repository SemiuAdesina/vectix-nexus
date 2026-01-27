import { getApiBaseUrl } from '@/lib/api/config';
import type { TimeLockedTransaction } from '../onchain/types';

const API_BASE = getApiBaseUrl();

export async function createTimeLock(timelock: Omit<TimeLockedTransaction, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; timelock: TimeLockedTransaction }> {
  const res = await fetch(`${API_BASE}/api/onchain/timelock/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...timelock, executeAt: timelock.executeAt.toISOString() }),
  });
  return res.json();
}

export async function cancelTimeLock(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/onchain/timelock/cancel/${id}`, { method: 'POST' });
  return res.json();
}

export async function getPendingTimeLocks(agentId: string): Promise<{ success: boolean; timelocks: TimeLockedTransaction[] }> {
  const res = await fetch(`${API_BASE}/api/onchain/timelock/pending?agentId=${agentId}`);
  return res.json();
}
