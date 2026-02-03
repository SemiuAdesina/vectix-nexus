import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import type { IAgentRuntime, Memory } from '@elizaos/core';
import { solanaSwapAction } from '../swap.ts';

describe('solanaSwapAction', () => {
  const mockRuntime = {} as unknown as IAgentRuntime;

  afterEach(() => {
    mock.restore();
  });

  describe('validate', () => {
    it('returns true when message contains swap and sol', async () => {
      const message = { content: { text: 'Swap SOL for USDC.' } } as Memory;
      const valid = await solanaSwapAction.validate(mockRuntime, message);
      expect(valid).toBe(true);
    });

    it('returns false when message does not match', async () => {
      const message = { content: { text: 'Send SOL.' } } as Memory;
      const valid = await solanaSwapAction.validate(mockRuntime, message);
      expect(valid).toBe(false);
    });
  });

  describe('handler', () => {
    it('returns not_implemented and calls callback', async () => {
      const callback = mock();
      const result = await solanaSwapAction.handler(
        mockRuntime,
        {} as Memory,
        undefined,
        {},
        callback as (r: { text: string }) => void
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('not_implemented');
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ text: expect.any(String) }));
    });
  });
});
