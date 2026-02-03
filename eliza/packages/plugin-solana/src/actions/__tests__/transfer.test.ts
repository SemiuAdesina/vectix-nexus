import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import type { IAgentRuntime, Memory } from '@elizaos/core';
import { solanaTransferAction } from '../transfer.ts';

describe('solanaTransferAction', () => {
  const mockRuntime = {
    logger: { error: mock(), debug: mock(), info: mock(), warn: mock() },
  } as unknown as IAgentRuntime;

  beforeEach(() => {
    delete process.env.SOLANA_PRIVATE_KEY;
  });

  afterEach(() => {
    mock.restore();
  });

  describe('validate', () => {
    it('returns true when message contains send and sol', async () => {
      const message = {
        content: { text: 'Send 0.5 SOL to 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
      } as Memory;
      const valid = await solanaTransferAction.validate(mockRuntime, message);
      expect(valid).toBe(true);
    });

    it('returns false when message does not match', async () => {
      const message = { content: { text: 'Hello world.' } } as Memory;
      const valid = await solanaTransferAction.validate(mockRuntime, message);
      expect(valid).toBe(false);
    });
  });

  describe('handler', () => {
    it('returns no_wallet when SOLANA_PRIVATE_KEY not set', async () => {
      const message = {
        content: { text: 'Send 0.1 SOL to 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
      } as Memory;
      const callback = mock();
      const result = await solanaTransferAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback as (r: { text: string }) => void
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('no_wallet');
    });
  });
});
