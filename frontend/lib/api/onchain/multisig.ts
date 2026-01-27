import { getApiBaseUrl } from '@/lib/api/config';
import type { MultiSigProposal } from '../onchain/types';

const API_BASE = getApiBaseUrl();

export async function createMultiSig(config: { agentId: string; threshold: number; signers: string[] }): Promise<{ success: boolean; multisigId: string }> {
  const res = await fetch(`${API_BASE}/api/onchain/multisig/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function createMultiSigProposal(multisigId: string, proposal: Omit<MultiSigProposal, 'id' | 'status' | 'signatures' | 'createdAt' | 'multisigId'>): Promise<{ success: boolean; proposal: MultiSigProposal }> {
  const res = await fetch(`${API_BASE}/api/onchain/multisig/proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ multisigId, ...proposal }),
  });
  return res.json();
}
