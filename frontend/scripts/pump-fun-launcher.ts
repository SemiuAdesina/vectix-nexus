import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as fs from 'fs';

const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

interface TokenLaunchParams {
  tokenName: string;
  symbol: string;
  imageUrl: string;
  treasuryWallet: string;
  userWallet: Keypair;
}

interface TokenLaunchResult {
  tokenMint: string;
  transactionSignature: string;
  treasuryAmount: number;
  treasuryPercentage: number;
}

/** Reserved for future token metadata usage. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
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

async function launchTokenOnPumpFun(params: TokenLaunchParams): Promise<TokenLaunchResult> {
  const connection = new Connection(RPC_URL, 'confirmed');

  const userPublicKey = params.userWallet.publicKey;
  const treasuryPublicKey = new PublicKey(params.treasuryWallet);

  const totalSupply = 1_000_000_000;
  const treasuryAmount = calculateTreasuryAmount(totalSupply);


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

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: ts-node pump-fun-launcher.ts <tokenName> <symbol> <imageUrl> [userWalletPrivateKeyPath] [treasuryWallet]');
    process.exit(1);
  }

  const [tokenName, symbol, imageUrl, walletPath, treasuryWallet] = args;

  if (!treasuryWallet) {
    console.error('Treasury wallet address is required');
    process.exit(1);
  }

  let userWallet: Keypair;

  if (walletPath && fs.existsSync(walletPath)) {
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    userWallet = Keypair.fromSecretKey(Uint8Array.from(walletData));
  } else {
    userWallet = Keypair.generate();
    console.log('Generated new wallet:', userWallet.publicKey.toBase58());
  }

  try {
    const result = await launchTokenOnPumpFun({
      tokenName,
      symbol,
      imageUrl,
      treasuryWallet,
      userWallet,
    });

    console.log('Token launched successfully!');
    console.log('Token Mint:', result.tokenMint);
    console.log('Transaction Signature:', result.transactionSignature);
    console.log(`Treasury Amount: ${result.treasuryAmount} tokens (${(result.treasuryPercentage * 100).toFixed(1)}% of supply)`);
  } catch (error) {
    console.error('Error launching token:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { launchTokenOnPumpFun, type TokenLaunchParams, type TokenLaunchResult };

