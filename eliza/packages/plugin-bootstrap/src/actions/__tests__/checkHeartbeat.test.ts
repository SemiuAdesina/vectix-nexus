import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { setupActionTest } from '../../__tests__/test-utils';
import type { MockRuntime } from '../../__tests__/test-utils';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { checkHeartbeat } from '../checkHeartbeat';

describe('checkHeartbeat', () => {
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

    it('returns true when message contains heartbeat', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Check the hackathon heartbeat.';
      }
      const isValid = await checkHeartbeat.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns true when message contains check and hackathon', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Check the hackathon status.';
      }
      const isValid = await checkHeartbeat.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );
      expect(isValid).toBe(true);
    });

    it('returns false when message does not match', async () => {
      if (mockMessage.content) {
        mockMessage.content.text = 'Hello world.';
      }
      const isValid = await checkHeartbeat.validate(
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

    it('calls callback with summary when fetch succeeds', async () => {
      const fetchMock = mock().mockResolvedValue({
        ok: true,
        text: async () => '# Stage 1\n- [ ] Task one\n- [ ] Task two',
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      const result = await checkHeartbeat.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn as (r: { text: string }) => void
      );

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith('https://colosseum.com/heartbeat.md');
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({ text: expect.any(String) })
      );
    });
  });
});
