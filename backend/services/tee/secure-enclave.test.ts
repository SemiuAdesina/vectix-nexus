import { describe, it, expect, beforeEach } from 'vitest';
import { SecureEnclave } from './secure-enclave';
import type { TEEConfig, SignRequest } from './tee.types';

describe('SecureEnclave', () => {
  let enclave: SecureEnclave;
  const config: TEEConfig = { provider: 'simulated' };

  beforeEach(() => {
    enclave = new SecureEnclave(config);
  });

  describe('storeKey', () => {
    it('stores a key and returns key ID', async () => {
      const privateKey = new Uint8Array([1, 2, 3, 4]);
      const keyId = await enclave.storeKey('agent1', privateKey);

      expect(keyId).toBeDefined();
      expect(typeof keyId).toBe('string');
      expect(keyId.startsWith('key-')).toBe(true);
    });
  });

  describe('sign', () => {
    it('signs a message with stored key', async () => {
      const privateKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
      const keyId = await enclave.storeKey('agent1', privateKey);

      const request: SignRequest = {
        keyId,
        agentId: 'agent1',
        message: new Uint8Array([5, 6, 7, 8]),
      };

      const response = await enclave.sign(request);

      expect(response.signature).toBeDefined();
      expect(response.publicKey).toBeDefined();
      expect(typeof response.publicKey).toBe('string');
      expect(response.attestation).toBeDefined();
      expect(response.attestation.valid).toBe(true);
    });

    it('throws error for non-existent key', async () => {
      const request: SignRequest = {
        keyId: 'non-existent',
        agentId: 'agent1',
        message: new Uint8Array([1, 2, 3]),
      };

      await expect(enclave.sign(request)).rejects.toThrow('Key not found');
    });

    it('throws error for agent ID mismatch', async () => {
      const privateKey = new Uint8Array([1, 2, 3, 4]);
      const keyId = await enclave.storeKey('agent1', privateKey);

      const request: SignRequest = {
        keyId,
        agentId: 'agent2',
        message: new Uint8Array([1, 2, 3]),
      };

      await expect(enclave.sign(request)).rejects.toThrow('Agent ID mismatch');
    });
  });

  describe('deleteKey', () => {
    it('deletes key with correct agent ID', async () => {
      const privateKey = new Uint8Array([1, 2, 3, 4]);
      const keyId = await enclave.storeKey('agent1', privateKey);

      const result = await enclave.deleteKey(keyId, 'agent1');
      expect(result).toBe(true);
    });

    it('fails to delete with wrong agent ID', async () => {
      const privateKey = new Uint8Array([1, 2, 3, 4]);
      const keyId = await enclave.storeKey('agent1', privateKey);

      const result = await enclave.deleteKey(keyId, 'agent2');
      expect(result).toBe(false);
    });

    it('fails to delete non-existent key', async () => {
      const result = await enclave.deleteKey('non-existent', 'agent1');
      expect(result).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('returns enclave status', async () => {
      const status = await enclave.getStatus();

      expect(status.available).toBe(true);
      expect(status.provider).toBe('simulated');
      expect(status.enclaveId).toBeDefined();
      expect(status.keyCount).toBe(0);
    });

    it('reflects key count', async () => {
      await enclave.storeKey('agent1', new Uint8Array([1, 2, 3]));
      await enclave.storeKey('agent2', new Uint8Array([4, 5, 6]));

      const status = await enclave.getStatus();
      expect(status.keyCount).toBe(2);
    });
  });

  describe('verifyAttestation', () => {
    it('always returns true for simulated provider', async () => {
      const report = {
        provider: 'simulated',
        enclaveId: 'test-enclave',
        timestamp: new Date(),
        signature: 'sig123',
        measurements: {},
        valid: true,
      };

      const result = await enclave.verifyAttestation(report);
      expect(result).toBe(true);
    });
  });
});
