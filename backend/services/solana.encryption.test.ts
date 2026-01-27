import { describe, it, expect, beforeEach } from 'vitest';
import * as solanaEncryption from './solana.encryption';

describe('solana.encryption', () => {
  beforeEach(() => {
    process.env.WALLET_MASTER_SECRET = 'test-master-secret-32-chars-long!!';
  });

  describe('encryptPrivateKey and decryptPrivateKey', () => {
    it('encrypts and decrypts private key', () => {
      const privateKey = JSON.stringify([1, 2, 3, 4, 5]);
      const encrypted = solanaEncryption.encryptPrivateKey(privateKey);
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');

      const decrypted = solanaEncryption.decryptPrivateKey(encrypted);
      expect(decrypted).toBe(privateKey);
    });

    it('works with custom master secret', () => {
      const privateKey = JSON.stringify([1, 2, 3]);
      const customSecret = 'custom-secret-32-chars-long!!';
      const encrypted = solanaEncryption.encryptPrivateKey(privateKey, customSecret);
      const decrypted = solanaEncryption.decryptPrivateKey(encrypted, customSecret);
      expect(decrypted).toBe(privateKey);
    });
  });
});
