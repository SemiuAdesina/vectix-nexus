import { TEEConfig, SecureKey, AttestationReport, SignRequest, SignResponse, TEEStatus } from './tee.types';
import { randomBytes } from 'crypto';
import { encryptInEnclave, decryptInEnclave, zeroMemory } from './enclave-crypto';
import { signMessage, derivePublicKey, generateAttestation } from './enclave-key-operations';
import { buildTEEConfig } from './enclave-config';

export class SecureEnclave {
  private config: TEEConfig;
  private keys: Map<string, SecureKey> = new Map();
  private enclaveId: string;

  constructor(config: TEEConfig = { provider: 'simulated' }) {
    this.config = config;
    this.enclaveId = config.enclaveId || `enclave-${randomBytes(8).toString('hex')}`;
  }

  async storeKey(agentId: string, privateKey: Uint8Array): Promise<string> {
    const keyId = `key-${randomBytes(16).toString('hex')}`;
    const encryptedPayload = encryptInEnclave(privateKey);
    const attestation = generateAttestation(this.config.provider, this.enclaveId);

    const secureKey: SecureKey = {
      keyId,
      agentId,
      encryptedPayload,
      attestation,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };

    this.keys.set(keyId, secureKey);
    return keyId;
  }

  async sign(request: SignRequest): Promise<SignResponse> {
    const secureKey = this.keys.get(request.keyId);
    if (!secureKey) throw new Error('Key not found in enclave');
    if (secureKey.agentId !== request.agentId) throw new Error('Agent ID mismatch');

    secureKey.lastAccessedAt = new Date();

    const privateKey = decryptInEnclave(secureKey.encryptedPayload);
    const signature = signMessage(privateKey, request.message);
    const publicKey = derivePublicKey(privateKey);

    zeroMemory(privateKey);

    return {
      signature,
      publicKey,
      attestation: generateAttestation(this.config.provider, this.enclaveId),
    };
  }

  async deleteKey(keyId: string, agentId: string): Promise<boolean> {
    const secureKey = this.keys.get(keyId);
    if (!secureKey || secureKey.agentId !== agentId) return false;
    this.keys.delete(keyId);
    return true;
  }

  async getStatus(): Promise<TEEStatus> {
    const attestation = generateAttestation(this.config.provider, this.enclaveId);
    return {
      available: true,
      provider: this.config.provider,
      enclaveId: this.enclaveId,
      attestationValid: attestation?.valid ?? false,
      keyCount: this.keys.size,
    };
  }

  async verifyAttestation(report: AttestationReport): Promise<boolean> {
    if (this.config.provider === 'simulated') return true;
    return report.valid && report.enclaveId === this.enclaveId;
  }

}

let enclaveInstance: SecureEnclave | null = null;

export function getSecureEnclave(): SecureEnclave {
  if (!enclaveInstance) {
    const config = buildTEEConfig();
    enclaveInstance = new SecureEnclave(config);
  }
  return enclaveInstance;
}

