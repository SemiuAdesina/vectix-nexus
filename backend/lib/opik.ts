import { Opik } from 'opik';

let client: Opik | null = null;

function getOpik(): Opik | null {
  if (client !== null) return client;
  if (!process.env.OPIK_API_KEY) return null;
  try {
    client = new Opik({
      apiKey: process.env.OPIK_API_KEY,
      projectName: process.env.OPIK_PROJECT_NAME ?? 'vectix-foundry',
      workspaceName: process.env.OPIK_WORKSPACE_NAME ?? 'default',
    });
  } catch {
    client = null;
  }
  return client;
}

export { getOpik };
