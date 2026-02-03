import { PublicKey } from '@solana/web3.js';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { getSolanaConnection } from '../lib/connection.ts';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function parseAddressFromMessage(text: string): string | null {
  const match = text.match(/(?:address|wallet|account|pubkey|public key)\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i);
  return match ? match[1] : null;
}

function isValidSolanaAddress(address: string): boolean {
  return BASE58_REGEX.test(address) && address.length >= 32 && address.length <= 44;
}

export const solanaBalanceAction = {
  name: 'SOLANA_BALANCE',
  description: 'Get SOL balance for a Solana wallet address. User can say "balance" or "check balance <address>".',
  examples: [
    [
      { name: 'user', content: { text: 'What is the balance of 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?' } },
      { name: 'agent', content: { text: 'Balance: X.XXX SOL.' } },
    ],
    [
      { name: 'user', content: { text: 'Check my Solana balance.' } },
      { name: 'agent', content: { text: 'Your balance is X.XXX SOL.' } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return (
      text.includes('balance') ||
      (text.includes('sol') && (text.includes('check') || text.includes('how much')))
    );
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; values?: Record<string, unknown>; error?: string }> => {
    const text = ((message?.content as { text?: string })?.text ?? '').trim();
    const address = parseAddressFromMessage(text) ?? process.env.SOLANA_PUBLIC_KEY ?? null;

    if (!address) {
      const msg = 'No address provided. Say "balance &lt;Solana address&gt;" or set SOLANA_PUBLIC_KEY for "my balance".';
      callback?.({ text: msg });
      return { success: false, text: msg, error: 'missing_address' };
    }

    if (!isValidSolanaAddress(address)) {
      const msg = 'Invalid Solana address (expected 32–44 base58 characters).';
      callback?.({ text: msg });
      return { success: false, text: msg, error: 'invalid_address' };
    }

    try {
      const connection = getSolanaConnection();
      const publicKey = new PublicKey(address);
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;
      const resultText = `Balance: ${sol.toFixed(6)} SOL (${lamports} lamports).`;
      callback?.({ text: resultText });
      return {
        success: true,
        text: resultText,
        values: { address, sol, lamports },
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      runtime.logger?.error?.({ err, address }, 'Solana balance failed');
      const msg = `Balance check failed: ${error}`;
      callback?.({ text: msg });
      return { success: false, text: msg, error };
    }
  },
};
