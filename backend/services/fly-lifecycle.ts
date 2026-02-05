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

export type MachineState = 'started' | 'stopped' | 'starting' | 'stopping' | 'destroyed';

export interface MachineStatus {
  id: string;
  name: string;
  state: MachineState;
  region: string;
  createdAt: string;
  updatedAt: string;
  privateIp?: string;
}

export async function getMachineStatus(
  machineId: string,
  appName: string = DEFAULT_APP_NAME
): Promise<MachineStatus> {
  if (useMockDeploy() || machineId.startsWith('mock-')) {
    return {
      id: machineId,
      name: 'mock',
      state: 'started',
      region: 'local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const headers = getAuthHeaders();
  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines/${machineId}`;

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get machine status: ${response.status} ${errorText}`);
  }

  const machine = await response.json() as Record<string, unknown>;
  return {
    id: machine.id as string,
    name: machine.name as string,
    state: machine.state as MachineState,
    region: machine.region as string,
    createdAt: machine.created_at as string,
    updatedAt: machine.updated_at as string,
    privateIp: machine.private_ip as string | undefined,
  };
}

export async function startMachine(
  machineId: string,
  appName: string = DEFAULT_APP_NAME
): Promise<void> {
  if (useMockDeploy() || machineId.startsWith('mock-')) return;
  const headers = getAuthHeaders();
  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines/${machineId}/start`;

  const response = await fetch(url, { method: 'POST', headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to start machine: ${response.status} ${errorText}`);
  }
}

export async function stopMachine(
  machineId: string,
  appName: string = DEFAULT_APP_NAME
): Promise<void> {
  if (useMockDeploy() || machineId.startsWith('mock-')) return;
  const headers = getAuthHeaders();
  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines/${machineId}/stop`;

  const response = await fetch(url, { method: 'POST', headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to stop machine: ${response.status} ${errorText}`);
  }
}

export async function restartMachine(
  machineId: string,
  appName: string = DEFAULT_APP_NAME
): Promise<void> {
  if (useMockDeploy() || machineId.startsWith('mock-')) return;
  const headers = getAuthHeaders();
  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines/${machineId}/restart`;

  const response = await fetch(url, { method: 'POST', headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to restart machine: ${response.status} ${errorText}`);
  }
}

export async function destroyMachine(
  machineId: string,
  appName: string = DEFAULT_APP_NAME
): Promise<void> {
  if (useMockDeploy() || machineId.startsWith('mock-')) return;
  const headers = getAuthHeaders();
  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines/${machineId}`;

  const response = await fetch(url, { method: 'DELETE', headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to destroy machine: ${response.status} ${errorText}`);
  }
}

