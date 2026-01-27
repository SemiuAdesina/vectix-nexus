interface FlyMachineConfig {
  image: string;
  env: Record<string, string>;
  services?: Array<{
    ports: Array<{
      port: number;
      handlers: string[];
    }>;
    protocol: string;
    internal_port: number;
  }>;
}

interface FlyMachineResponse {
  id: string;
  name: string;
  state: string;
  region: string;
  private_ip?: string;
  config?: {
    env?: Record<string, string>;
  };
}

const FLY_API_HOSTNAME = process.env.FLY_API_HOSTNAME || 'https://api.machines.dev';
const DEFAULT_APP_NAME = process.env.FLY_APP_NAME || 'eliza-agent';
const DEFAULT_IMAGE = process.env.FLY_IMAGE || 'registry.fly.io/eliza-agent:latest';

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

export async function createFlyMachine(
  characterConfig: string,
  appName: string = DEFAULT_APP_NAME
): Promise<FlyMachineResponse> {
  const headers = getAuthHeaders();

  const machineConfig: FlyMachineConfig = {
    image: DEFAULT_IMAGE,
    env: {
      CHARACTER_CONFIG: characterConfig,
    },
    services: [
      {
        ports: [
          {
            port: 80,
            handlers: ['http'],
          },
        ],
        protocol: 'tcp',
        internal_port: 3000,
      },
    ],
  };

  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ config: machineConfig }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fly.io API error: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<FlyMachineResponse>;
}

export async function getMachineIP(
  machineId: string,
  appName: string = DEFAULT_APP_NAME
): Promise<string | null> {
  const headers = getAuthHeaders();
  const url = `${FLY_API_HOSTNAME}/v1/apps/${appName}/machines/${machineId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const machine = (await response.json()) as FlyMachineResponse;
  return machine.private_ip || null;
}

export type { FlyMachineResponse };

