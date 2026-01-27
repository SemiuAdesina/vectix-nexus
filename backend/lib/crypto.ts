import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 600000;

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

export function generateApiKey(): string {
  const randomPart = crypto.randomBytes(24).toString('base64url');
  return `vx_${randomPart}`;
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function hashPassword(password: string, salt?: Buffer): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, usedSalt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
  return {
    hash: hash.toString('hex'),
    salt: usedSalt.toString('hex'),
  };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  const salt = Buffer.from(storedSalt, 'hex');
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function deriveKey(masterKey: Buffer, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

export function encryptData(plaintext: string, masterSecret: string): string {
  const masterKey = crypto.createHash('sha256').update(masterSecret).digest();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterKey, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decryptData(ciphertext: string, masterSecret: string): string {
  const masterKey = crypto.createHash('sha256').update(masterSecret).digest();
  const combined = Buffer.from(ciphertext, 'base64');

  if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error('Invalid ciphertext');
  }

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(masterKey, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    return decipher.update(encrypted) + decipher.final('utf8');
  } catch {
    throw new Error('Decryption failed - invalid key or corrupted data');
  }
}

export function generateHmac(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyHmac(data: string, signature: string, secret: string): boolean {
  const expected = generateHmac(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars * 2) + data.slice(-visibleChars);
}

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
