import { describe, it, expect } from 'vitest';
import { signMessage, derivePublicKey, generateAttestation } from './enclave-key-operations';

describe('Enclave Key Operations', () => {
  describe('signMessage', () => {
    it('signs a message with private key', () => {
      const privateKey = new Uint8Array([1, 2, 3, 4, 5]);
      const message = new Uint8Array([6, 7, 8, 9, 10]);
      const signature = signMessage(privateKey, message);

      expect(signature).toBeDefined();
      expect(signature instanceof Uint8Array).toBe(true);
      expect(signature.length).toBeGreaterThan(0);
    });

    it('produces consistent signatures', () => {
      const privateKey = new Uint8Array([1, 2, 3]);
      const message = new Uint8Array([4, 5, 6]);
      const sig1 = signMessage(privateKey, message);
      const sig2 = signMessage(privateKey, message);

      expect(sig1).toEqual(sig2);
    });
  });

  describe('derivePublicKey', () => {
    it('derives public key from private key', () => {
      const privateKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
      const publicKey = derivePublicKey(privateKey);

      expect(publicKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(0);
    });
  });

  describe('generateAttestation', () => {
    it('generates attestation report', () => {
      const attestation = generateAttestation('simulated', 'enclave-123');

      expect(attestation.provider).toBe('simulated');
      expect(attestation.enclaveId).toBe('enclave-123');
      expect(attestation.timestamp).toBeInstanceOf(Date);
      expect(attestation.signature).toBeDefined();
      expect(attestation.valid).toBe(true);
      expect(attestation.measurements).toBeDefined();
    });
  });
});
