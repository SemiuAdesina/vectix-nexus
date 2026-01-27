import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';
import type { WalletBalance, WithdrawResult } from './types';

const BACKEND_URL = getBackendUrl();

export interface WithdrawRequestResult {
  success: boolean;
  message: string;
  expiresAt: string;
  tokenHint: string;
}

export async function getAgentBalance(id: string): Promise<WalletBalance> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.agents.balance(id)}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch balance: ${response.status}`);
  const data = (await response.json()) as { balance: WalletBalance };
  return data.balance;
}

export async function requestWithdrawal(id: string, destinationAddress?: string): Promise<WithdrawRequestResult> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.agents.withdrawRequest(id)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ destinationAddress }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Withdrawal request failed');
  return data as WithdrawRequestResult;
}

export async function confirmWithdrawal(id: string, token: string): Promise<WithdrawResult> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.agents.withdrawConfirm(id)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ token }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Withdrawal confirmation failed');
  return data as WithdrawResult;
}

export async function updateUserWallet(walletAddress: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.auth.wallet}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ walletAddress }),
  });
  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to update wallet');
  }
}

export async function getUserWallet(): Promise<string | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.auth.wallet}`, { headers });
  if (!response.ok) return null;
  const data = (await response.json()) as { walletAddress?: string };
  return data.walletAddress || null;
}
