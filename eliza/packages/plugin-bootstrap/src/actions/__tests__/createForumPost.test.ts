import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { setupActionTest } from '../../__tests__/test-utils';
import type { MockRuntime } from '../../__tests__/test-utils';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';

const readHackathonSecretsMock = mock();
mock.module('../../lib/secrets', () => ({ readHackathonSecrets: readHackathonSecretsMock }));

const { createForumPost } = await import('../createForumPost');

describe('createForumPost', () => {
  let mockRuntime: MockRuntime;
  let mockMessage: Partial<Memory>;
  let mockState: Partial<State>;
  let callbackFn: ReturnType<typeof mock>;

  afterEach(() => {
    mock.restore();
  });

  describe('validate', () => {
    beforeEach(() => {
      const setup = setupActionTest();
      mockRuntime = setup.mockRuntime;
      mockMessage = setup.mockMessage;
      mockState = setup.mockState;
    });

    it('returns true when message contains post and forum', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Post on the Colosseum forum.';
      }
      const isValid = await createForumPost.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns false when message does not match', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Hello world.';
      }
      const isValid = await createForumPost.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(false);
    });
  });

  describe('handler', () => {
    beforeEach(() => {
      const setup = setupActionTest();
      mockRuntime = setup.mockRuntime;
      mockMessage = setup.mockMessage;
      mockState = setup.mockState;
      callbackFn = mock();
    });

    it('calls callback with error when no API key', async () => {
      readHackathonSecretsMock.mockReturnValue(null);
      if (mockMessage.content) {
        mockMessage.content.text = "Post on forum. Title: 'Test'. Body: 'Body'. Tags: ai";
      }

      const result = await createForumPost.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(result.success).toBe(false);
      expect(result.text).toContain('API key');
    });

    it('sends title, body, tags to API on success', async () => {
      readHackathonSecretsMock.mockReturnValue({ apiKey: 'test-key', claimCode: 'code' });
      const fetchMock = mock().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      if (mockMessage.content) {
        mockMessage.content.text =
          "Post on forum. Title: 'Hello'. Body: 'World'. Tags: ideation, ai";
      }

      const result = await createForumPost.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(result.success).toBe(true);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.title).toBeDefined();
      expect(body.body).toBeDefined();
      expect(Array.isArray(body.tags)).toBe(true);
    });
  });
});
