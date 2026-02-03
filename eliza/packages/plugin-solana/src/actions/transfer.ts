import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { getSolanaConnection } from '../lib/connection.ts';

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const MIN_RENT = 890880;
const FEE_LAMPORTS = 5000;

function parseTransferFromMessage(text: string): { to?: string; amount?: number } | null {
  const toMatch = text.match(/(?:to|send to|recipient)\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i);
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:sol|SOL)?/);
  const to = toMatch?.[1] ?? null;
  const amount = amountMatch ? parseFloat(amountMatch[1]) : NaN;
  if (!to && (isNaN(amount) || amount <= 0)) {
    return null;
  }
  return { to: to ?? undefined, amount: !isNaN(amount) && amount > 0 ? amount : undefined };
}

function isValidSolanaAddress(address: string): boolean {
  return BASE58_REGEX.test(address) && address.length >= 32 && address.length <= 44;
}

function loadKeypair(): Keypair | null {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  try {
    const decoded = raw.trim().replace(/^\[|\]$/g, '').split(',').map(Number);
    if (decoded.length !== 64) {
      return null;
    }
    return Keypair.fromSecretKey(new Uint8Array(decoded));
  } catch {
    return null;
  }
}

export const solanaTransferAction = {
  name: 'SOLANA_TRANSFER',
  description: 'Send SOL to a Solana address. User says amount and destination, e.g. "send 0.5 SOL to <address>".',
  examples: [
    [
      { name: 'user', content: { text: 'Send 0.1 SOL to 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' } },
      { name: 'agent', content: { text: 'Transfer sent. Signature: ...' } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = ((message?.content as { text?: string })?.text ?? '').toLowerCase();
    return (
      (text.includes('send') || text.includes('transfer')) &&
      (text.includes('sol') || /\d+(\.\d+)?\s*(sol)?/i.test(text))
    );
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: (result: { text: string }) => void
  ): Promise<{ success: boolean; text: string; values?: Record<string, unknown>; error?: string }> => {
    const keypair = loadKeypair();
    if (!keypair) {
      const msg = 'Solana wallet not configured. Set SOLANA_PRIVATE_KEY (64-byte array as comma-separated numbers).';
      callback?.({ text: msg });
      return { success: false, text: msg, error: 'no_wallet' };
    }

    const text = ((message?.content as { text?: string })?.text ?? '').trim();
    const parsed = parseTransferFromMessage(text);
    const toAddress = parsed?.to ?? null;
    const amountSol = parsed?.amount;

    if (!toAddress || !isValidSolanaAddress(toAddress)) {
      const msg = 'Invalid or missing recipient address. Say "send X SOL to <Solana address>".';
      callback?.({ text: msg });
      return { success: false, text: msg, error: 'invalid_recipient' };
    }

    if (amountSol == null || amountSol <= 0) {
      const msg = 'Invalid or missing amount. Say "send X SOL to <address>" with X > 0.';
      callback?.({ text: msg });
      return { success: false, text: msg, error: 'invalid_amount' };
    }

    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    if (lamports < FEE_LAMPORTS + MIN_RENT) {
      const msg = `Amount too small (min ~${((FEE_LAMPORTS + MIN_RENT) / LAMPORTS_PER_SOL).toFixed(6)} SOL after fees).`;
      callback?.({ text: msg });
      return { success: false, text: msg, error: 'amount_too_small' };
    }

    try {
      const connection = getSolanaConnection();
      const balance = await connection.getBalance(keypair.publicKey);
      const required = lamports + FEE_LAMPORTS + MIN_RENT;
      if (balance < required) {
        const msg = `Insufficient balance. Have ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL, need ${(required / LAMPORTS_PER_SOL).toFixed(6)} SOL.`;
        callback?.({ text: msg });
        return { success: false, text: msg, error: 'insufficient_balance' };
      }

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports,
        })
      );
      const signature = await sendAndConfirmTransaction(connection, tx, [keypair], {
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
      const resultText = `Transfer of ${amountSol} SOL to ${toAddress.slice(0, 8)}... completed. Signature: ${signature}`;
      callback?.({ text: resultText });
      return {
        success: true,
        text: resultText,
        values: { signature, toAddress, amountSol, lamports },
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      runtime.logger?.error?.({ err, toAddress, amountSol }, 'Solana transfer failed');
      const msg = `Transfer failed: ${error}`;
      callback?.({ text: msg });
      return { success: false, text: msg, error };
    }
  },
};
