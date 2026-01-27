export interface TEEConfig {
  provider: 'phala' | 'intel-sgx' | 'aws-nitro' | 'simulated' | 'azure' | 'google-cloud';
  enclaveId?: string;
  attestationUrl?: string;
  apiKey?: string;
  endpoint?: string;
}

export interface SecureKey {
  keyId: string;
  agentId: string;
  encryptedPayload: string;
  attestation: AttestationReport | null;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface AttestationReport {
  provider: string;
  enclaveId: string;
  timestamp: Date;
  signature: string;
  measurements: EnclaveHash;
  valid: boolean;
}

export interface EnclaveHash {
  mrenclave: string;
  mrsigner: string;
  isvProdId: number;
  isvSvn: number;
}

export interface SignRequest {
  keyId: string;
  message: Uint8Array;
  agentId: string;
}

export interface SignResponse {
  signature: Uint8Array;
  publicKey: string;
  attestation: AttestationReport | null;
}

export interface TEEStatus {
  available: boolean;
  provider: string;
  enclaveId: string | null;
  attestationValid: boolean;
  keyCount: number;
}

