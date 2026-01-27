import { describe, it, expect } from 'vitest';
import {
  generateSecureToken,
  generateApiKey,
  hashApiKey,
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  generateHmac,
  verifyHmac,
  maskSensitiveData,
  secureCompare,
} from './crypto';

describe('generateSecureToken', () => {
  it('generates tokens of specified length', () => {
    const token32 = generateSecureToken(32);
    const token64 = generateSecureToken(64);
    expect(token32.length).toBeGreaterThan(0);
    expect(token64.length).toBeGreaterThan(token32.length);
  });

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateSecureToken()));
    expect(tokens.size).toBe(100);
  });
});

describe('generateApiKey', () => {
  it('generates keys with vx_ prefix', () => {
    const key = generateApiKey();
    expect(key.startsWith('vx_')).toBe(true);
  });
});

describe('hashApiKey', () => {
  it('produces consistent hashes', () => {
    const key = 'vx_test_key_123';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different keys', () => {
    const hash1 = hashApiKey('key1');
    const hash2 = hashApiKey('key2');
    expect(hash1).not.toBe(hash2);
  });
});

describe('password hashing', () => {
  it('hashes and verifies passwords correctly', () => {
    const password = 'SecurePassword123!';
    const { hash, salt } = hashPassword(password);
    expect(verifyPassword(password, hash, salt)).toBe(true);
  });

  it('rejects incorrect passwords', () => {
    const { hash, salt } = hashPassword('correct');
    expect(verifyPassword('incorrect', hash, salt)).toBe(false);
  });

  it('produces different salts each time', () => {
    const result1 = hashPassword('password');
    const result2 = hashPassword('password');
    expect(result1.salt).not.toBe(result2.salt);
  });
});

describe('encryption/decryption', () => {
  const secret = 'test-master-secret-32-chars-long';

  it('encrypts and decrypts data correctly', () => {
    const plaintext = 'sensitive data to encrypt';
    const encrypted = encryptData(plaintext, secret);
    const decrypted = decryptData(encrypted, secret);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext for same plaintext', () => {
    const plaintext = 'test data';
    const enc1 = encryptData(plaintext, secret);
    const enc2 = encryptData(plaintext, secret);
    expect(enc1).not.toBe(enc2);
  });

  it('fails with wrong secret', () => {
    const encrypted = encryptData('test', secret);
    expect(() => decryptData(encrypted, 'wrong-secret')).toThrow();
  });

  it('fails with corrupted data', () => {
    expect(() => decryptData('invalid-base64', secret)).toThrow();
  });
});

describe('HMAC', () => {
  const secret = 'hmac-secret';

  it('generates and verifies HMAC', () => {
    const data = 'data to sign';
    const signature = generateHmac(data, secret);
    expect(verifyHmac(data, signature, secret)).toBe(true);
  });

  it('rejects tampered data', () => {
    const signature = generateHmac('original', secret);
    expect(verifyHmac('tampered', signature, secret)).toBe(false);
  });
});

describe('maskSensitiveData', () => {
  it('masks middle characters', () => {
    expect(maskSensitiveData('1234567890')).toBe('1234**7890');
  });

  it('handles short strings', () => {
    expect(maskSensitiveData('abc')).toBe('***');
  });
});

describe('secureCompare', () => {
  it('returns true for equal strings', () => {
    expect(secureCompare('test', 'test')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(secureCompare('test', 'test2')).toBe(false);
    expect(secureCompare('test', 'TEST')).toBe(false);
  });
});
