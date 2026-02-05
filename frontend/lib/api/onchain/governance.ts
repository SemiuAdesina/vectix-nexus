import { getApiBaseUrl } from '@/lib/api/config';
import type { GovernanceProposal, GovernanceVote } from './types';
import { safeJson } from './safe-json';

const API_BASE = getApiBaseUrl();

export async function createGovernanceProposal(proposal: Omit<GovernanceProposal, 'id' | 'status' | 'votesFor' | 'votesAgainst' | 'createdAt'>): Promise<{ success: boolean; proposal: GovernanceProposal }> {
  const res = await fetch(`${API_BASE}/api/onchain/governance/proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposal),
  });
  return safeJson(res);
}

export async function voteOnProposal(proposalId: string, vote: Omit<GovernanceVote, 'id' | 'timestamp' | 'proposalId'>): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/api/onchain/governance/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposalId, ...vote }),
  });
  const data = await safeJson<{ success: boolean; error?: string }>(res);
  if (!res.ok) {
    throw new Error(data.error || 'Failed to vote');
  }
  return data;
}

export async function getGovernanceProposals(voterId?: string): Promise<{ success: boolean; proposals: GovernanceProposal[] }> {
  const url = voterId ? `${API_BASE}/api/onchain/governance/proposals?voter=${encodeURIComponent(voterId)}` : `${API_BASE}/api/onchain/governance/proposals`;
  const res = await fetch(url);
  try {
    return await safeJson(res);
  } catch {
    return { success: false, proposals: [] };
  }
}

export async function getGovernanceProposal(id: string): Promise<{ success: boolean; proposal: GovernanceProposal }> {
  const res = await fetch(`${API_BASE}/api/onchain/governance/proposal/${id}`);
  return safeJson(res);
}

export async function executeGovernanceProposal(proposalId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/onchain/governance/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposalId }),
  });
  return safeJson(res);
}
