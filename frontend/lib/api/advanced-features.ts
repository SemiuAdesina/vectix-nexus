'use client';

import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';

export type {
  RiskFlag, PreflightStats, PreflightDecision,
  RuleType, SupervisorRule, RuleViolation, SupervisorDecision,
  ShadowTrade, ShadowHolding, ShadowPortfolio, PerformanceMetrics, ReportCard,
  TEEStatus, NarrativeToken, NarrativeCluster, NarrativeSignal, NarrativeStatus,
} from './advanced-features.types';

import type {
  PreflightStats, SupervisorRule, SupervisorDecision,
  ShadowPortfolio, ReportCard, TEEStatus, NarrativeCluster, NarrativeSignal, NarrativeStatus,
} from './advanced-features.types';

const API_BASE = getBackendUrl();

export async function getPreflightStats(agentId: string): Promise<PreflightStats> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.preflight.stats(agentId)}`, { headers });
  const data = await res.json();
  return data.stats;
}

export async function getSupervisorRules(): Promise<SupervisorRule[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.supervisor.rules}`, { headers });
  const data = await res.json();
  return data.rules;
}

export async function updateSupervisorRule(ruleId: string, updates: Partial<SupervisorRule>): Promise<void> {
  const headers = await getAuthHeaders();
  await fetch(`${API_BASE}${API_ENDPOINTS.supervisor.ruleDetail(ruleId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
}

export async function evaluateTrade(request: {
  agentId: string;
  action: 'BUY' | 'SELL';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  portfolioValueSol: number;
  tokenLiquidity: number;
  tokenMarketCap: number;
  dailyTradeCount: number;
}): Promise<SupervisorDecision> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.supervisor.evaluate}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  const data = await res.json();
  return data.decision;
}

export async function createShadowPortfolio(agentId: string, startingSol = 10): Promise<ShadowPortfolio> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.shadow.create}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ agentId, startingSol }),
  });
  const data = await res.json();
  return data.portfolio;
}

export async function getShadowReport(agentId: string): Promise<ReportCard | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.shadow.report(agentId)}`, { headers });
  const data = await res.json();
  return data.report;
}

export async function stopShadowMode(agentId: string): Promise<void> {
  const headers = await getAuthHeaders();
  await fetch(`${API_BASE}${API_ENDPOINTS.shadow.stop(agentId)}`, { method: 'POST', headers });
}

export async function updateShadowPrices(agentId: string): Promise<ShadowPortfolio | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.shadow.updatePrices(agentId)}`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  return data.success ? data.portfolio : null;
}

export async function getTEEStatus(): Promise<TEEStatus> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.tee.status}`, { headers });
  const data = await res.json();
  return data.status;
}

export async function storeKeyInTEE(agentId: string, privateKey: string): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.tee.storeKey}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ agentId, privateKey }),
  });
  const data = await res.json();
  return data.keyId;
}

export async function getNarrativeStatus(): Promise<NarrativeStatus> {
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.narrative.status}`);
  const data = await res.json();
  return { 
    available: data.available, 
    demoMode: data.demoMode || false,
    message: data.message 
  };
}

export async function getNarrativeClusters(): Promise<NarrativeCluster[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.narrative.clusters}`, { headers });
  const data = await res.json();
  return data.clusters || [];
}

export async function getNarrativeSignals(): Promise<NarrativeSignal[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.narrative.signals}`, { headers });
  const data = await res.json();
  return data.signals || [];
}
