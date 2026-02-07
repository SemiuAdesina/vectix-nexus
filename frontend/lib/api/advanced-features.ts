'use client';

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

import { getApiBaseUrl } from './config';

const API_BASE = getApiBaseUrl();

export async function getPreflightStats(agentId: string): Promise<PreflightStats> {
  const res = await fetch(`${API_BASE}/api/preflight/stats/${agentId}`);
  const data = await res.json();
  return data.stats;
}

export async function getSupervisorRules(): Promise<SupervisorRule[]> {
  const res = await fetch(`${API_BASE}/api/supervisor/rules`);
  const data = await res.json();
  return data.rules;
}

export async function updateSupervisorRule(ruleId: string, updates: Partial<SupervisorRule>): Promise<void> {
  await fetch(`${API_BASE}/api/supervisor/rules/${ruleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_BASE}/api/supervisor/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  return data.decision;
}

export async function createShadowPortfolio(agentId: string, startingSol = 10): Promise<ShadowPortfolio> {
  const res = await fetch(`${API_BASE}/api/shadow/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, startingSol }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Failed to start shadow mode (${res.status})`);
  if (!data.portfolio) throw new Error('Invalid response: no portfolio');
  return data.portfolio;
}

export async function getShadowReport(agentId: string): Promise<ReportCard | null> {
  const res = await fetch(`${API_BASE}/api/shadow/report/${agentId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Failed to load report (${res.status})`);
  return data.report ?? null;
}

export async function stopShadowMode(agentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/shadow/stop/${agentId}`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Failed to stop shadow mode (${res.status})`);
}

export async function getTEEStatus(): Promise<TEEStatus> {
  const res = await fetch(`${API_BASE}/api/tee/status`);
  const data = await res.json();
  return data.status;
}

export async function storeKeyInTEE(agentId: string, privateKey: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/tee/store-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, privateKey }),
  });
  const data = await res.json();
  return data.keyId;
}

export async function getNarrativeStatus(): Promise<NarrativeStatus> {
  const res = await fetch(`${API_BASE}/api/narrative/status`);
  const data = await res.json();
  return { available: data.available, message: data.message };
}

export async function getNarrativeClusters(): Promise<NarrativeCluster[]> {
  const res = await fetch(`${API_BASE}/api/narrative/clusters`);
  const data = await res.json();
  return data.clusters || [];
}

export async function getNarrativeSignals(): Promise<NarrativeSignal[]> {
  const res = await fetch(`${API_BASE}/api/narrative/signals`);
  const data = await res.json();
  return data.signals || [];
}
