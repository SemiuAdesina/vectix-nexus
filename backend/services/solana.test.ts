import { describe, it, expect, beforeEach } from 'vitest';
import { WalletManager } from './solana';

describe('solana', () => {
  beforeEach(() => {
    process.env.WALLET_MASTER_SECRET = 'test-master-secret-32-chars-long!!';
  });

  describe('WalletManager', () => {
    it('generates wallet', () => {
      const result = WalletManager.generateWallet();
      expect(result.wallet).toBeDefined();
      expect(result.wallet.address).toBeTruthy();
      expect(result.wallet.encryptedPrivateKey).toBeTruthy();
      expect(result.pluginConfig.SOLANA_PRIVATE_KEY).toBeTruthy();
    });

    it('generates wallet with master secret', () => {
      const result = WalletManager.generateWallet('custom-secret');
      expect(result.wallet).toBeDefined();
      expect(result.wallet.encryptedPrivateKey).toBeTruthy();
    });
  });
});
