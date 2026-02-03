import * as fs from 'fs';
import * as path from 'path';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';

const COLOSSEUM_API = 'https://agents.colosseum.com/api';
const SECRETS_FILE = 'hackathon_secrets.json';

function generateAgentName(): string {
  const prefix = 'Vectix';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${suffix}`;
}

function parseNameFromMessage(text: string): string | null {
  const match = text.match(/using\s+the\s+name\s+([A-Za-z0-9_-]+)/i);
  return match ? match[1].trim() : null;
}

export const registerForHackathon = {
  name: 'REGISTER_HACKATHON',
  description: 'Register this agent for the Colosseum Hackathon. POSTs to the Colosseum API and saves apiKey and claimCode to hackathon_secrets.json.',
  examples: [
    [
      { name: 'user', content: { text: 'Please register for the Colosseum Hackathon now.' } },
      { name: 'agent', content: { text: 'I have registered. API key and claim code saved to hackathon_secrets.json.' } },
    ],
    [
      { name: 'user', content: { text: 'Register for the Colosseum Hackathon using the name Vectix-Agent.' } },
      { name: 'agent', content: { text: 'Registered as Vectix-Agent. API key and claim code saved to hackathon_secrets.json.' } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return (
      text.includes('register') && (text.includes('colosseum') || text.includes('hackathon'))
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; values?: Record<string, unknown>; error?: string }> => {
    const rawText = (message?.content as { text?: string })?.text ?? '';
    const name = parseNameFromMessage(rawText) ?? generateAgentName();
    try {
      const res = await fetch(`${COLOSSEUM_API}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error ?? data?.message ?? `HTTP ${res.status}`;
        const text = `Registration failed: ${errMsg}`;
        callback?.({ text });
        return { success: false, text, error: errMsg };
      }

      const apiKey = data.apiKey ?? data.api_key;
      const claimCode = data.claimCode ?? data.claim_code;
      const claimUrl = data.claimUrl ?? data.claim_url ?? '';

      const secrets = {
        apiKey: apiKey ?? '',
        claimCode: claimCode ?? '',
        claimUrl,
        agentName: name,
        registeredName: name,
        agentId: data.agent?.id,
        registeredAt: new Date().toISOString(),
      };

      const outPath = path.resolve(process.cwd(), SECRETS_FILE);
      fs.writeFileSync(outPath, JSON.stringify(secrets, null, 2), 'utf8');

      const text = `Registered for Colosseum Hackathon as "${name}". API key and claim code saved to ${SECRETS_FILE}. Give the claim code to a human to claim prizes.`;
      callback?.({ text });
      return {
        success: true,
        text,
        values: { colosseumRegistered: true, agentName: name, secretsPath: outPath },
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const text = `Registration failed: ${error}`;
      callback?.({ text });
      return { success: false, text, error };
    }
  },
};
