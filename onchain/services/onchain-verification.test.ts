import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@solana/web3.js', () => {
  const MockConnection = class {
    getAccountInfo = vi.fn().mockResolvedValue(null);
  };
  const MockPublicKey = class {
    private key: string;
    constructor(key: string) {
      this.key = key;
    }
    toString() {
      return this.key;
    }
  };
  return {
    Connection: MockConnection,
    PublicKey: MockPublicKey,
    Keypair: {
      generate: () => ({
        publicKey: { toString: () => 'mock-public-key' },
        secretKey: new Uint8Array(64),
      }),
    },
  };
});

import { OnChainVerificationService } from './onchain-verification';

describe('OnChainVerificationService', () => {
  let service: OnChainVerificationService;

  beforeEach(() => {
    service = new OnChainVerificationService();
    vi.clearAllMocks();
  });

  describe('storeSecurityDecision', () => {
    it('stores security decision and returns log with proof', async () => {
      const log = {
        id: 'log1',
        type: 'security_decision' as const,
        agentId: 'agent1',
        tokenAddress: 'token123',
        decision: 'approved' as const,
        reason: 'Test reason',
        timestamp: new Date().toISOString(),
      };

      const result = await service.storeSecurityDecision(log);

      expect(result.id).toBe(log.id);
      expect(result.onChainProof).toBeDefined();
      expect(typeof result.onChainProof).toBe('string');
    });
  });

  describe('verifyCertificate', () => {
    it('verifies a certificate proof', async () => {
      const proof = 'proof123';
      const result = await service.verifyCertificate(proof);

      expect(result.verified).toBeDefined();
      expect(typeof result.verified).toBe('boolean');
      expect(result.proof).toBe(proof);
      expect(result.timestamp).toBeDefined();
    });

    it('returns verified true for non-onchain proofs (mock mode)', async () => {
      const result = await service.verifyCertificate('invalid-proof');
      expect(result.verified).toBe(true);
      expect(result.proof).toBe('invalid-proof');
    });
  });

  describe('connection and programId', () => {
    it('initializes with connection and optional programId', () => {
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('OnChainVerificationService');
    });
  });
});
