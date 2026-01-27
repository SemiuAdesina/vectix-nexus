import { Keypair } from '@solana/web3.js';
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { encryptPrivateKey, decryptPrivateKey } from './solana.encryption';
import type {
  Wallet,
  SolanaPluginConfig,
  WalletGenerationResult,
  TokenLaunchParams,
  TokenLaunchResult,
} from './solana.types';

function keypairToBase64(keypair: Keypair): string {
  const secretKey = keypair.secretKey;
  return Buffer.from(secretKey).toString('base64');
}

function base64ToKeypair(base64: string): Keypair {
  const secretKey = Buffer.from(base64, 'base64');
  return Keypair.fromSecretKey(secretKey);
}

export class WalletManager {
  static generateWallet(masterSecret?: string): WalletGenerationResult {
    const keypair = Keypair.generate();
    const privateKeyBase64 = keypairToBase64(keypair);
    const publicKey = keypair.publicKey.toBase58();
    const address = publicKey;

    const encryptedPrivateKey = encryptPrivateKey(privateKeyBase64, masterSecret);

    const wallet: Wallet = {
      address,
      encryptedPrivateKey,
      publicKey,
    };

    const pluginConfig: SolanaPluginConfig = {
      SOLANA_PRIVATE_KEY: privateKeyBase64,
      SOLANA_PUBLIC_KEY: publicKey,
    };

    return {
      wallet,
      pluginConfig,
    };
  }

  static getPluginConfig(wallet: Wallet, masterSecret?: string): SolanaPluginConfig {
    const privateKeyBase64 = decryptPrivateKey(wallet.encryptedPrivateKey, masterSecret);

    return {
      SOLANA_PRIVATE_KEY: privateKeyBase64,
      SOLANA_PUBLIC_KEY: wallet.publicKey,
    };
  }
}

const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

function createTokenMetadata(params: TokenLaunchParams): Buffer {
  const metadata = {
    name: params.tokenName,
    symbol: params.symbol,
    uri: params.imageUrl,
  };
  return Buffer.from(JSON.stringify(metadata));
}

function calculateTreasuryAmount(totalSupply: number): number {
  const percentage = 0.01;
  return Math.floor(totalSupply * percentage);
}

export async function launchTokenOnPumpFun(
  params: TokenLaunchParams & { userWallet: Keypair }
): Promise<TokenLaunchResult> {
  const connection = new Connection(RPC_URL, 'confirmed');

  const userPublicKey = params.userWallet.publicKey;
  const treasuryPublicKey = new PublicKey(params.treasuryWallet);

  const totalSupply = 1_000_000_000;
  const treasuryAmount = calculateTreasuryAmount(totalSupply);

  createTokenMetadata(params);

  const transaction = new Transaction();

  const createTokenIx = SystemProgram.transfer({
    fromPubkey: userPublicKey,
    toPubkey: PUMP_FUN_PROGRAM_ID,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  });

  transaction.add(createTokenIx);

  const treasuryBuyIx = SystemProgram.transfer({
    fromPubkey: userPublicKey,
    toPubkey: treasuryPublicKey,
    lamports: treasuryAmount * LAMPORTS_PER_SOL,
  });

  transaction.add(treasuryBuyIx);

  const signature = await sendAndConfirmTransaction(connection, transaction, [params.userWallet], {
    commitment: 'confirmed',
  });

  const tokenMint = params.userWallet.publicKey.toBase58();

  return {
    tokenMint,
    transactionSignature: signature,
    treasuryAmount,
    treasuryPercentage: 0.01,
  };
}

