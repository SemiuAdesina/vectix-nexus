import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { setupActionTest } from '../../__tests__/test-utils';
import type { MockRuntime } from '../../__tests__/test-utils';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { registerForHackathon } from '../registerForHackathon';

describe('registerForHackathon', () => {
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

    it('returns true when message contains register and colosseum', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Register for the Colosseum Hackathon.';
      }
      const isValid = await registerForHackathon.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns true when message contains register and hackathon', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Please register for the hackathon.';
      }
      const isValid = await registerForHackathon.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns false when message does not match', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Hello world.';
      }
      const isValid = await registerForHackathon.validate(
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

    it('calls API with name from message', async () => {
      const fetchMock = mock().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Conflict' }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      if (mockMessage.content) {
        mockMessage.content.text = 'Register for the Colosseum Hackathon using the name Vectix-Agent.';
      }

      await registerForHackathon.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(fetchMock).toHaveBeenCalledWith(
        'https://agents.colosseum.com/api/agents',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.name).toBe('Vectix-Agent');
    });
  });
});
