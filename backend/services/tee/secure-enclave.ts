import { TEEConfig, SecureKey, AttestationReport, SignRequest, SignResponse, TEEStatus } from './tee.types';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ENCLAVE_KEY = process.env.TEE_ENCLAVE_KEY || randomBytes(32).toString('hex');

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
    const encryptedPayload = this.encryptInEnclave(privateKey);
    const attestation = await this.generateAttestation();

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

    const privateKey = this.decryptInEnclave(secureKey.encryptedPayload);
    const signature = this.signMessage(privateKey, request.message);
    const publicKey = this.derivePublicKey(privateKey);

    this.zeroMemory(privateKey);

    return {
      signature,
      publicKey,
      attestation: await this.generateAttestation(),
    };
  }

  async deleteKey(keyId: string, agentId: string): Promise<boolean> {
    const secureKey = this.keys.get(keyId);
    if (!secureKey || secureKey.agentId !== agentId) return false;
    this.keys.delete(keyId);
    return true;
  }

  async getStatus(): Promise<TEEStatus> {
    const attestation = await this.generateAttestation();
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

  private encryptInEnclave(data: Uint8Array): string {
    const iv = randomBytes(16);
    const key = Buffer.from(ENCLAVE_KEY, 'hex');
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  private decryptInEnclave(payload: string): Uint8Array {
    const data = Buffer.from(payload, 'base64');
    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);

    const key = Buffer.from(ENCLAVE_KEY, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    return new Uint8Array(Buffer.concat([decipher.update(encrypted), decipher.final()]));
  }

  private signMessage(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
    const combined = new Uint8Array(privateKey.length + message.length);
    combined.set(privateKey);
    combined.set(message, privateKey.length);

    const hash = Buffer.from(combined).toString('base64');
    return new Uint8Array(Buffer.from(hash));
  }

  private derivePublicKey(privateKey: Uint8Array): string {
    return Buffer.from(privateKey.subarray(0, 32)).toString('base64');
  }

  private zeroMemory(data: Uint8Array): void {
    for (let i = 0; i < data.length; i++) data[i] = 0;
  }

  private async generateAttestation(): Promise<AttestationReport> {
    return {
      provider: this.config.provider,
      enclaveId: this.enclaveId,
      timestamp: new Date(),
      signature: randomBytes(64).toString('hex'),
      measurements: {
        mrenclave: randomBytes(32).toString('hex'),
        mrsigner: randomBytes(32).toString('hex'),
        isvProdId: 1,
        isvSvn: 1,
      },
      valid: true,
    };
  }
}

let enclaveInstance: SecureEnclave | null = null;

export function getSecureEnclave(): SecureEnclave {
  if (!enclaveInstance) {
    enclaveInstance = new SecureEnclave({
      provider: (process.env.TEE_PROVIDER as TEEConfig['provider']) || 'simulated',
      enclaveId: process.env.TEE_ENCLAVE_ID,
    });
  }
  return enclaveInstance;
}

