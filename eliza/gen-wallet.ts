/**
 * One-time script: generates a Solana keypair and prints env lines for eliza/.env.
 * Run from eliza/: npx bun run gen-wallet.ts
 * Then: copy NEW_PUBLIC_KEY and NEW_PRIVATE_KEY into eliza/.env, restart agent, fund the new address at https://faucet.solana.com
 */
import { Keypair } from '@solana/web3.js';

const key = Keypair.generate();
console.log('NEW_PUBLIC_KEY=' + key.publicKey.toBase58());
console.log('NEW_PRIVATE_KEY=' + key.secretKey.toString());
