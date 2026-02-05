import type { IAgentRuntime, Memory, State } from '@elizaos/core';

const HEARTBEAT_URL = 'https://colosseum.com/heartbeat.md';

function summarizeHeartbeat(markdown: string): string {
  const lines = markdown.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('# ')) {
      if (current.length) sections.push(current.join(' '));
      current = [line.replace(/^#+\s*/, '').trim()];
    } else if (line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('- [X]')) {
      const task = line.replace(/^-\s*\[.?\]\s*/, '').trim();
      if (task) current.push(task);
    } else if (line.startsWith('- ') && !line.startsWith('- [')) {
      current.push(line.slice(2).trim());
    } else if (line.length > 0 && line.length < 120) {
      current.push(line);
    }
  }
  if (current.length) sections.push(current.join(' '));

  if (sections.length === 0) return markdown.slice(0, 1500);
  return sections.join('\n\n');
}

export const checkHeartbeat = {
  name: 'CHECK_HEARTBEAT',
  description:
    'Fetch the Colosseum hackathon heartbeat (periodic sync checklist). Summarizes forum activity, leaderboard, deadlines, and next steps.',
  examples: [
    [
      { name: 'user', content: 'Check the hackathon heartbeat.' },
      { name: 'agent', content: 'Here is the current heartbeat summary: [stage, deadlines, next steps].' },
    ],
    [
      { name: 'user', content: 'What is the current stage of the hackathon?' },
      { name: 'agent', content: 'According to the heartbeat: [summary].' },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return (
      text.includes('heartbeat') ||
      text.includes('check') && text.includes('hackathon') ||
      text.includes('stage') && text.includes('hackathon') ||
      text.includes('status') && text.includes('colosseum')
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    _options: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; values?: Record<string, unknown>; error?: string }> => {
    try {
      const res = await fetch(HEARTBEAT_URL);
      const raw = await res.text();

      if (!res.ok) {
        const text = `Heartbeat fetch failed: HTTP ${res.status}`;
        callback?.({ text });
        return { success: false, text, error: `HTTP ${res.status}` };
      }

      const summary = summarizeHeartbeat(raw);
      const text = `Colosseum hackathon heartbeat:\n\n${summary}`;
      callback?.({ text });
      return {
        success: true,
        text,
        values: { lastHeartbeatCheck: new Date().toISOString(), heartbeatLength: raw.length },
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const text = `Heartbeat check failed: ${error}`;
      callback?.({ text });
      return { success: false, text, error };
    }
  },
};
