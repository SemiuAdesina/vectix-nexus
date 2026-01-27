import { describe, it, expect } from 'vitest';
import { encryptInEnclave, decryptInEnclave, zeroMemory } from './enclave-crypto';

describe('Enclave Crypto', () => {
  describe('encryptInEnclave', () => {
    it('encrypts data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const encrypted = encryptInEnclave(data);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('produces different output for same input', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const encrypted1 = encryptInEnclave(data);
      const encrypted2 = encryptInEnclave(data);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptInEnclave', () => {
    it('decrypts encrypted data', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]);
      const encrypted = encryptInEnclave(original);
      const decrypted = decryptInEnclave(encrypted);

      expect(decrypted).toEqual(original);
    });

    it('handles empty data', () => {
      const original = new Uint8Array([]);
      const encrypted = encryptInEnclave(original);
      const decrypted = decryptInEnclave(encrypted);

      expect(decrypted).toEqual(original);
    });
  });

  describe('zeroMemory', () => {
    it('zeros out memory buffer', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      zeroMemory(buffer);

      expect(buffer.every(byte => byte === 0)).toBe(true);
    });
  });
});
