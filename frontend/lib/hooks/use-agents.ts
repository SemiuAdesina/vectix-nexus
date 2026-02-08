'use client';

import useSWR from 'swr';
import { useAuth } from '@clerk/nextjs';
import { getAgents, getAgentStatus, getAgentLogs } from '@/lib/api/agents';
import type { Agent, AgentStatus, LogEntry } from '@/lib/api/types';

const POLL_INTERVAL = 5000;

export interface AgentWithLiveData extends Agent {
  liveStatus?: AgentStatus;
  lastLog?: LogEntry;
  uptime?: string;
}

export function useAgents() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data, error, isLoading, mutate } = useSWR<Agent[]>(
    isLoaded && isSignedIn ? 'agents' : null,
    getAgents,
    { refreshInterval: POLL_INTERVAL, revalidateOnFocus: true }
  );

  return {
    agents: data || [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}

export function useAgentStatus(agentId: string | null) {
  const { data, error } = useSWR<AgentStatus>(
    agentId ? `agent-status-${agentId}` : null,
    () => (agentId ? getAgentStatus(agentId) : Promise.reject()),
    { refreshInterval: POLL_INTERVAL }
  );

  return { status: data, isError: !!error };
}

export function useAgentLogs(agentId: string | null, limit = 1) {
  const { data, error } = useSWR(
    agentId ? `agent-logs-${agentId}` : null,
    () => (agentId ? getAgentLogs(agentId, { limit }) : Promise.reject()),
    { refreshInterval: POLL_INTERVAL }
  );

  return { logs: data?.logs || [], isError: !!error };
}

export function calculateUptime(createdAt: string, status: string): string {
  if (status !== 'running') return 'Offline';

  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  return 'Just started';
}

