import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { setupActionTest } from '../../__tests__/test-utils';
import type { MockRuntime } from '../../__tests__/test-utils';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';

const readHackathonSecretsMock = mock();
mock.module('../../lib/secrets', () => ({ readHackathonSecrets: readHackathonSecretsMock }));

const { createProjectDraft } = await import('../createProjectDraft');

describe('createProjectDraft', () => {
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

    it('returns true when message contains create and project', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Create a new project draft.';
      }
      const isValid = await createProjectDraft.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns true for "project draft"', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'I want to create a project draft.';
      }
      const isValid = await createProjectDraft.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns false when message does not mention create/project', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Hello world.';
      }
      const isValid = await createProjectDraft.validate(
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
        mockMessage.content.text =
          'Create project. Name: Test. Description: Desc. Repo: https://github.com/a/b. Solana: Uses Solana. Tags: ai';
      }

      const result = await createProjectDraft.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(result.success).toBe(false);
      expect(result.text).toContain('API key');
      expect(callbackFn).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('API key') }));
    });

    it('sends repoLink and solanaIntegration to API on success', async () => {
      readHackathonSecretsMock.mockReturnValue({ apiKey: 'test-key', claimCode: 'code' });
      const fetchMock = mock().mockResolvedValue({
        ok: true,
        json: async () => ({ project: { slug: 'vectix-foundry' } }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      if (mockMessage.content) {
        mockMessage.content.text =
          "Create project. Name: 'Vectix Foundry'. Description: 'Agent framework.' Repo Link: https://github.com/vectix/core. Solana Integration: Uses Solana for verification. Tags: ai, infra";
      }

      const result = await createProjectDraft.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://agents.colosseum.com/api/my-project',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
        })
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.name).toBeDefined();
      expect(body.description).toBeDefined();
      expect(body.repoLink).toBeDefined();
      expect(body.solanaIntegration).toBeDefined();
      expect(Array.isArray(body.tags)).toBe(true);
    });

    it('calls callback with error when API returns non-ok', async () => {
      readHackathonSecretsMock.mockReturnValue({ apiKey: 'test-key', claimCode: 'code' });
      const fetchMock = mock().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Validation failed' }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      if (mockMessage.content) {
        mockMessage.content.text = 'Create project. Name: X. Description: Y. Tags: ai';
      }

      const result = await createProjectDraft.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(result.success).toBe(false);
      expect(result.text).toContain('Validation failed');
    });
  });
});
