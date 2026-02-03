import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { readHackathonSecrets } from '../lib/secrets';

const COLOSSEUM_API = 'https://agents.colosseum.com/api';

function parseForumPostFromMessage(text: string): { title: string; body: string; tags: string[] } {
  const titleMatch = text.match(/Title:\s*['"]([^'"]+)['"]/i) ?? text.match(/Title:\s*(\S[^\n]+?)(?=\s+Body:|\s+Tags:|$)/i);
  const bodyMatch = text.match(/Body:\s*['"]([^'"]+)['"]/is) ?? text.match(/Body:\s*(\S[\s\S]+?)(?=\s+Tags:|$)/i);
  const tagsMatch = text.match(/Tags?:\s*([a-z,-]+)/i);

  const title = (titleMatch?.[1] ?? 'Post from Vectix Agent').trim().slice(0, 200);
  const body = (bodyMatch?.[1] ?? 'Hello from Vectix. Looking for hackathon collaborators.').trim().slice(0, 10000);
  const tagsRaw = tagsMatch?.[1] ?? 'ideation,ai';
  const tags = tagsRaw.split(/[\s,]+/).filter(Boolean).slice(0, 5);

  return { title, body, tags };
}

export const createForumPost = {
  name: 'CREATE_FORUM_POST',
  description:
    'Post on the Colosseum hackathon forum. Requires hackathon_secrets.json (API key). Parse Title, Body, and Tags from the user message.',
  examples: [
    [
      {
        name: 'user',
        content: {
          text: "Please post on the Colosseum forum. Title: 'Building an ElizaOS Wrapper'. Body: 'Hello world. I am an autonomous agent on Vectix.' Tags: ideation, ai",
        },
      },
      { name: 'agent', content: { text: 'Posted to the forum. Post ID saved.' } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return (
      (text.includes('post') && (text.includes('forum') || text.includes('colosseum'))) ||
      text.includes('post on the colosseum forum')
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; values?: Record<string, unknown>; error?: string }> => {
    const secrets = readHackathonSecrets();
    if (!secrets?.apiKey) {
      const text = 'No API key found. Register for the hackathon first (hackathon_secrets.json).';
      callback?.({ text });
      return { success: false, text, error: 'Missing API key' };
    }

    const rawText = (message?.content as { text?: string })?.text ?? '';
    const { title, body, tags } = parseForumPostFromMessage(rawText);

    try {
      const res = await fetch(`${COLOSSEUM_API}/forum/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secrets.apiKey}`,
        },
        body: JSON.stringify({ title, body, tags }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error ?? data?.message ?? `HTTP ${res.status}`;
        const text = `Forum post failed: ${errMsg}`;
        callback?.({ text });
        return { success: false, text, error: errMsg };
      }

      const postId = data?.post?.id ?? data?.postId;
      const text = `Posted to the Colosseum forum. Post ID: ${postId ?? 'saved'}. Title: "${title}".`;
      callback?.({ text });
      return {
        success: true,
        text,
        values: { forumPostId: postId, forumTitle: title },
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const text = `Forum post failed: ${error}`;
      callback?.({ text });
      return { success: false, text, error };
    }
  },
};
