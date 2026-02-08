type OpikClient = {
  trace: (opts: { name: string; input?: Record<string, unknown> }) => {
    update: (u: { output?: Record<string, unknown> }) => unknown;
    end: () => unknown;
  };
};

let client: OpikClient | null | undefined;

export async function getOpikClient(): Promise<OpikClient | null> {
  if (client !== undefined) return client;
  if (!process.env.OPIK_API_KEY) {
    client = null;
    return null;
  }
  try {
    const { Opik } = await import('opik');
    client = new Opik({
      apiKey: process.env.OPIK_API_KEY,
      projectName: process.env.OPIK_PROJECT_NAME ?? 'vectix-foundry',
      workspaceName: process.env.OPIK_WORKSPACE_NAME ?? 'default',
    }) as OpikClient;
  } catch {
    client = null;
  }
  return client;
}

export function resetOpikClientForTesting(): void {
  client = undefined;
}
