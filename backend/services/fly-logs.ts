const FLY_API_HOSTNAME = process.env.FLY_API_HOSTNAME || 'https://api.machines.dev';
const DEFAULT_APP_NAME = process.env.FLY_APP_NAME || 'eliza-agent';

function useMockDeploy(): boolean {
  const mock = process.env.MOCK_FLY_DEPLOY;
  if (mock !== undefined && mock !== '') {
    const v = String(mock).toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes') return true;
  }
  return !process.env.FLY_API_TOKEN || String(process.env.FLY_API_TOKEN).trim() === '';
}

function getAuthHeaders(): Record<string, string> {
  const token = process.env.FLY_API_TOKEN;
  if (!token) {
    throw new Error('FLY_API_TOKEN environment variable is required');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  source: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  nextToken?: string;
}

const DOCKER_ACTIVITY_STORE = new Map<string, LogEntry[]>();
const DOCKER_ACTIVITY_MAX = 50;

export function appendDockerActivity(machineId: string, entry: Omit<LogEntry, 'timestamp' | 'level' | 'source'>): void {
  if (!machineId || machineId.length === 0) return;
  const list = DOCKER_ACTIVITY_STORE.get(machineId) ?? [];
  const full: LogEntry = {
    timestamp: new Date().toISOString(),
    message: entry.message,
    level: 'info',
    source: 'agent',
  };
  list.unshift(full);
  if (list.length > DOCKER_ACTIVITY_MAX) list.length = DOCKER_ACTIVITY_MAX;
  DOCKER_ACTIVITY_STORE.set(machineId, list);
}

function getDockerActivity(machineId: string, limit: number): LogEntry[] {
  const list = DOCKER_ACTIVITY_STORE.get(machineId) ?? [];
  return list.slice(0, limit);
}

export async function getMachineLogs(
  machineId: string,
  appName: string = DEFAULT_APP_NAME,
  options: { limit?: number; nextToken?: string } = {}
): Promise<LogsResponse> {
  if (useMockDeploy() || machineId.startsWith('mock-')) {
    const limit = options.limit ?? 50;
    const stored = getDockerActivity(machineId, limit);
    if (stored.length > 0) return { logs: stored };
    return {
      logs: [{
        timestamp: new Date().toISOString(),
        message: 'Agent running on VPS (Docker). Activity will appear here when reported.',
        level: 'info',
        source: 'system',
      }],
    };
  }
  const headers = getAuthHeaders();
  const limit = options.limit || 50;

  const params = new URLSearchParams({
    instance: machineId,
    limit: limit.toString(),
  });

  if (options.nextToken) {
    params.append('next_token', options.nextToken);
  }

  const url = `https://api.fly.io/v1/apps/${appName}/logs?${params.toString()}`;

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    if (response.status === 404) {
      return { logs: [] };
    }
    const errorText = await response.text();
    throw new Error(`Failed to fetch logs: ${response.status} ${errorText}`);
  }

  const data = await response.json() as { data?: Record<string, unknown>[]; meta?: { next_token?: string } };

  const logs: LogEntry[] = (data.data || []).map((entry) => ({
    timestamp: (entry.timestamp as string) || new Date().toISOString(),
    message: (entry.message as string) || '',
    level: parseLogLevel(entry.level as string),
    source: (entry.source as string) || 'agent',
  }));

  return {
    logs,
    nextToken: data.meta?.next_token,
  };
}

function parseLogLevel(level: string | undefined): 'info' | 'warn' | 'error' {
  if (!level) return 'info';
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('error') || lowerLevel.includes('fatal')) return 'error';
  if (lowerLevel.includes('warn')) return 'warn';
  return 'info';
}

export async function streamLogs(
  machineId: string,
  appName: string = DEFAULT_APP_NAME,
  onLog: (log: LogEntry) => void,
  signal?: AbortSignal
): Promise<void> {
  if (useMockDeploy() || machineId.startsWith('mock-')) return;
  const headers = getAuthHeaders();

  const url = `https://api.fly.io/v1/apps/${appName}/logs/stream?instance=${machineId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      Accept: 'text/event-stream',
    },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to stream logs: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onLog({
            timestamp: data.timestamp || new Date().toISOString(),
            message: data.message || '',
            level: parseLogLevel(data.level),
            source: data.source || 'agent',
          });
        } catch {
          onLog({
            timestamp: new Date().toISOString(),
            message: line.slice(6),
            level: 'info',
            source: 'agent',
          });
        }
      }
    }
  }
}

