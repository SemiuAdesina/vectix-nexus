import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ENCLAVE_KEY = process.env.TEE_ENCLAVE_KEY || randomBytes(32).toString('hex');

export function encryptInEnclave(data: Uint8Array): string {
  const iv = randomBytes(16);
  const key = Buffer.from(ENCLAVE_KEY, 'hex');
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptInEnclave(payload: string): Uint8Array {
  const data = Buffer.from(payload, 'base64');
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const key = Buffer.from(ENCLAVE_KEY, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return new Uint8Array(decrypted);
}

export function zeroMemory(buffer: Uint8Array): void {
  buffer.fill(0);
}
