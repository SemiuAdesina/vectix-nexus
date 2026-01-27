import { randomBytes } from 'crypto';

export function signMessage(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
  const combined = new Uint8Array(privateKey.length + message.length);
  combined.set(privateKey);
  combined.set(message, privateKey.length);

  const hash = Buffer.from(combined).toString('base64');
  return new Uint8Array(Buffer.from(hash));
}

export function derivePublicKey(privateKey: Uint8Array): string {
  return Buffer.from(privateKey.subarray(0, 32)).toString('base64');
}

export function generateAttestation(provider: string, enclaveId: string) {
  return {
    provider,
    enclaveId,
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
