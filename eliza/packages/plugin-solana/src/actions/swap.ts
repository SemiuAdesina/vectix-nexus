import type { IAgentRuntime, Memory, State } from '@elizaos/core';

export const solanaSwapAction = {
  name: 'SOLANA_SWAP',
  description: 'Placeholder for token swap. Currently not implemented; use SOLANA_TRANSFER for SOL transfers.',
  examples: [
    [
      { name: 'user', content: { text: 'Swap SOL for USDC.' } },
      { name: 'agent', content: { text: 'Swap is not implemented yet. I can check balance or send SOL.' } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return text.includes('swap') && (text.includes('sol') || text.includes('token'));
  },
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; error?: string }> => {
    const text =
      'Token swap is not implemented in this plugin yet. You can use SOLANA_BALANCE to check SOL or SOLANA_TRANSFER to send SOL.';
    callback?.({ text });
    return { success: false, text, error: 'not_implemented' };
  },
};
