import { describe, expect, it, mock, afterEach } from 'bun:test';
import type { IAgentRuntime, Memory } from '@elizaos/core';
import { solanaBalanceAction } from '../balance.ts';

describe('solanaBalanceAction', () => {
  const mockRuntime = {
    logger: { error: mock(), debug: mock(), info: mock(), warn: mock() },
  } as unknown as IAgentRuntime;

  afterEach(() => {
    mock.restore();
  });

  describe('validate', () => {
    it('returns true when message contains balance', async () => {
      const message = { content: { text: 'What is my Solana balance?' } } as Memory;
      const valid = await solanaBalanceAction.validate(mockRuntime, message);
      expect(valid).toBe(true);
    });

    it('returns true when message contains check and sol', async () => {
      const message = { content: { text: 'Check my SOL balance.' } } as Memory;
      const valid = await solanaBalanceAction.validate(mockRuntime, message);
      expect(valid).toBe(true);
    });

    it('returns false when message does not match', async () => {
      const message = { content: { text: 'Hello world.' } } as Memory;
      const valid = await solanaBalanceAction.validate(mockRuntime, message);
      expect(valid).toBe(false);
    });
  });

  describe('handler', () => {
    it('returns error when no address and no SOLANA_PUBLIC_KEY', async () => {
      const orig = process.env.SOLANA_PUBLIC_KEY;
      delete process.env.SOLANA_PUBLIC_KEY;
      const message = { content: { text: 'Check balance.' } } as Memory;
      const callback = mock();
      const result = await solanaBalanceAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback as (r: { text: string }) => void
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('missing_address');
      if (orig !== undefined) process.env.SOLANA_PUBLIC_KEY = orig;
    });

    it('returns error for invalid address when SOLANA_PUBLIC_KEY is invalid', async () => {
      const orig = process.env.SOLANA_PUBLIC_KEY;
      process.env.SOLANA_PUBLIC_KEY = 'short';
      const message = { content: { text: 'Check my balance.' } } as Memory;
      const callback = mock();
      const result = await solanaBalanceAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback as (r: { text: string }) => void
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_address');
      if (orig !== undefined) process.env.SOLANA_PUBLIC_KEY = orig;
      else delete process.env.SOLANA_PUBLIC_KEY;
    });
  });
});
