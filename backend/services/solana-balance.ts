import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { decryptPrivateKey } from './solana.encryption';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

export interface WalletBalance {
  sol: number;
  lamports: number;
}

export async function getWalletBalance(walletAddress: string): Promise<WalletBalance> {
  const connection = getConnection();
  const publicKey = new PublicKey(walletAddress);

  const lamports = await connection.getBalance(publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;

  return { sol, lamports };
}

export interface WithdrawParams {
  encryptedPrivateKey: string;
  destinationAddress: string;
  masterSecret?: string;
}

export interface WithdrawResult {
  success: boolean;
  signature?: string;
  amountSol?: number;
  error?: string;
}

const MIN_RENT_EXEMPT_BALANCE = 890880;
const TRANSFER_FEE_LAMPORTS = 5000;

export async function withdrawFunds(params: WithdrawParams): Promise<WithdrawResult> {
  const { encryptedPrivateKey, destinationAddress, masterSecret } = params;

  try {
    const privateKeyString = decryptPrivateKey(encryptedPrivateKey, masterSecret);
    const privateKeyArray = JSON.parse(privateKeyString) as number[];
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

    const connection = getConnection();
    const sourcePublicKey = keypair.publicKey;
    const destinationPublicKey = new PublicKey(destinationAddress);

    const balance = await connection.getBalance(sourcePublicKey);

    const maxTransfer = balance - TRANSFER_FEE_LAMPORTS - MIN_RENT_EXEMPT_BALANCE;

    if (maxTransfer <= 0) {
      return {
        success: false,
        error: `Insufficient balance. Current: ${balance / LAMPORTS_PER_SOL} SOL, ` +
               `Required minimum: ${(TRANSFER_FEE_LAMPORTS + MIN_RENT_EXEMPT_BALANCE) / LAMPORTS_PER_SOL} SOL`,
      };
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sourcePublicKey,
        toPubkey: destinationPublicKey,
        lamports: maxTransfer,
      })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sourcePublicKey;

    transaction.sign(keypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());

    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    return {
      success: true,
      signature,
      amountSol: maxTransfer / LAMPORTS_PER_SOL,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during withdrawal',
    };
  }
}

export async function validateWalletAddress(address: string): Promise<boolean> {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

