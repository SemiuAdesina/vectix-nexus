import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { readHackathonSecrets } from '../lib/secrets';

const COLOSSEUM_API = 'https://agents.colosseum.com/api';

function parseProjectFromMessage(text: string): {
  name: string;
  description: string;
  repoLink?: string;
  solanaIntegration?: string;
  tags: string[];
} {
  const nameMatch = text.match(/Name:\s*['"]([^'"]+)['"]/i) ?? text.match(/Name:\s*(\S[^\n]+?)(?=\s+Description:|\s+Tags:|$)/i);
  const descMatch = text.match(/Description:\s*['"]([^'"]+)['"]/is) ?? text.match(/Description:\s*(\S[\s\S]+?)(?=\s+Tags:|$)/i);
  const tagsMatch = text.match(/Tags?:\s*([a-z,-]+)/i);

  const name = (nameMatch?.[1] ?? 'Vectix Foundry').trim().slice(0, 200);
  const description = (descMatch?.[1] ?? 'An autonomous agent framework that simplifies building on Solana.').trim().slice(0, 5000);
  const tagsRaw = tagsMatch?.[1] ?? 'ai,infra,defi';
  const tags = tagsRaw.split(/[\s,]+/).filter(Boolean).slice(0, 3);

  return { name, description, tags };
}

export const createProjectDraft = {
  name: 'CREATE_PROJECT_DRAFT',
  description:
    'Create a Colosseum hackathon project draft (my-project). Requires hackathon_secrets.json. Parse Name, Description, and Tags from the user message.',
  examples: [
    [
      {
        name: 'user',
        content:
          "Create a new project draft. Name: 'Vectix Foundry'. Description: 'An autonomous agent framework that simplifies building on Solana.' Tags: ai, infra, defi",
      },
      { name: 'agent', content: 'Project draft created. Vectix Foundry is on the leaderboard.' },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return (
      (text.includes('create') && (text.includes('project') || text.includes('draft'))) ||
      text.includes('project draft') ||
      text.includes('new project')
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; values?: Record<string, unknown>; error?: string }> => {
    const secrets = readHackathonSecrets();
    if (!secrets?.apiKey) {
      const text = 'No API key found. Register for the hackathon first (hackathon_secrets.json).';
      callback?.({ text });
      return { success: false, text, error: 'Missing API key' };
    }

    const rawText = (message?.content as { text?: string })?.text ?? '';
    const { name, description, repoLink, solanaIntegration, tags } = parseProjectFromMessage(rawText);

    try {
      const body: Record<string, unknown> = { name, description, tags };
      if (repoLink) body.repoLink = repoLink;
      if (solanaIntegration) body.solanaIntegration = solanaIntegration;

      const res = await fetch(`${COLOSSEUM_API}/my-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secrets.apiKey}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error ?? data?.message ?? `HTTP ${res.status}`;
        const text = `Create project failed: ${errMsg}`;
        callback?.({ text });
        return { success: false, text, error: errMsg };
      }

      const slug = data?.project?.slug ?? data?.slug ?? name;
      const text = `Project draft created: "${name}" (slug: ${slug}). You can update it with PUT /my-project before submitting.`;
      callback?.({ text });
      return {
        success: true,
        text,
        values: { projectSlug: slug, projectName: name },
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const text = `Create project failed: ${error}`;
      callback?.({ text });
      return { success: false, text, error };
    }
  },
};
