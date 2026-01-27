export interface Wallet {
  address: string;
  encryptedPrivateKey: string;
  publicKey: string;
}

export interface SolanaPluginConfig {
  SOLANA_PRIVATE_KEY: string;
  SOLANA_PUBLIC_KEY: string;
}

export interface WalletGenerationResult {
  wallet: Wallet;
  pluginConfig: SolanaPluginConfig;
}

export interface TokenLaunchParams {
  tokenName: string;
  symbol: string;
  imageUrl: string;
  treasuryWallet: string;
  userWallet: { publicKey: { toBase58: () => string } };
}

export interface TokenLaunchResult {
  tokenMint: string;
  transactionSignature: string;
  treasuryAmount: number;
  treasuryPercentage: number;
}

