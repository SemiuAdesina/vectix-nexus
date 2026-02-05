import { getAuthHeaders, getBackendUrl } from './auth';
import type { Agent, AgentStatus, DeployAgentRequest, DeployAgentResponse, LogsResponse } from './types';

const BACKEND_URL = getBackendUrl();

export async function deployAgent(request: DeployAgentRequest): Promise<DeployAgentResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/deploy-agent`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(request),
  });

  const data = (await response.json()) as DeployAgentResponse;
  if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
  return data;
}

export async function getAgents(): Promise<Agent[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch agents: ${response.status}`);
  const data = (await response.json()) as { agents: Agent[] };
  return data.agents;
}

export async function getAgent(id: string): Promise<Agent> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch agent: ${response.status}`);
  const data = (await response.json()) as { agent: Agent };
  return data.agent;
}

export async function startAgent(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/start`, { method: 'POST', headers });
  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to start agent');
  }
}

export async function stopAgent(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/stop`, { method: 'POST', headers });
  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to stop agent');
  }
}

export async function restartAgent(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/restart`, { method: 'POST', headers });
  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to restart agent');
  }
}

export async function deleteAgent(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}`, { method: 'DELETE', headers });
  if (!response.ok) {
    const data = (await response.json()) as { error: string };
    throw new Error(data.error || 'Failed to delete agent');
  }
}

export async function getAgentStatus(id: string): Promise<AgentStatus> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/status`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch agent status: ${response.status}`);
  return response.json() as Promise<AgentStatus>;
}

export async function getAgentLogs(id: string, options: { limit?: number; nextToken?: string } = {}): Promise<LogsResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.nextToken) params.set('nextToken', options.nextToken);

  const response = await fetch(`${BACKEND_URL}/api/agents/${id}/logs?${params.toString()}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch logs: ${response.status}`);
  return response.json() as Promise<LogsResponse>;
}

