import { getAuthHeaders, getBackendUrl } from './auth';
import type { WalletBalance, WithdrawResult } from './types';

const BACKEND_URL = getBackendUrl();

export async function getAgentBalance(id: string): Promise<WalletBalance> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/balance`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch balance: ${response.status}`);
  const data = (await response.json()) as { balance: WalletBalance };
  return data.balance;
}

export async function withdrawAgentFunds(id: string, destinationAddress?: string): Promise<WithdrawResult> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/withdraw`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ destinationAddress }),
  });
  return response.json() as Promise<WithdrawResult>;
}

export async function updateUserWallet(walletAddress: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/user/wallet`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ walletAddress }),
  });
  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to update wallet');
  }
}

