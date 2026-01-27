import { describe, it, expect } from 'vitest';
import { Request } from 'express';
import { redactSensitiveData, extractContext } from './audit.utils';

describe('redactSensitiveData', () => {
  it('returns null/undefined as-is', () => {
    expect(redactSensitiveData(null)).toBeNull();
    expect(redactSensitiveData(undefined)).toBeUndefined();
  });

  it('returns primitives as-is', () => {
    expect(redactSensitiveData('string')).toBe('string');
    expect(redactSensitiveData(123)).toBe(123);
    expect(redactSensitiveData(true)).toBe(true);
  });

  it('redacts sensitive keys in objects', () => {
    const input = { username: 'john', password: 'secret123', apiKey: 'key123' };
    const result = redactSensitiveData(input) as Record<string, unknown>;
    
    expect(result.username).toBe('john');
    expect(result.password).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
  });

  it('redacts nested sensitive data', () => {
    const input = {
      user: { name: 'john', token: 'abc123' },
      config: { encryptedSecrets: 'data' },
    };
    const result = redactSensitiveData(input) as Record<string, Record<string, unknown>>;
    
    expect(result.user.name).toBe('john');
    expect(result.user.token).toBe('[REDACTED]');
    expect(result.config.encryptedSecrets).toBe('[REDACTED]');
  });

  it('handles arrays', () => {
    const input = [{ password: 'secret' }, { name: 'test' }];
    const result = redactSensitiveData(input) as Array<Record<string, unknown>>;
    
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('test');
  });

  it('is case-insensitive for sensitive keys', () => {
    const input = { PASSWORD: 'test', ApiKey: 'key', privatekey: 'pk' };
    const result = redactSensitiveData(input) as Record<string, unknown>;
    
    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.ApiKey).toBe('[REDACTED]');
    expect(result.privatekey).toBe('[REDACTED]');
  });
});

describe('extractContext', () => {
  const createMockRequest = (overrides = {}): Request => ({
    ip: '192.168.1.1',
    socket: { remoteAddress: '192.168.1.1' },
    headers: {
      'user-agent': 'Mozilla/5.0 Test Browser',
      'x-request-id': 'req-123',
      'x-session-id': 'sess-456',
    },
    ...overrides,
  } as unknown as Request);

  it('extracts context from request', () => {
    const req = createMockRequest();
    const context = extractContext(req, 'user-123');

    expect(context.userId).toBe('user-123');
    expect(context.ipAddress).toBe('192.168.1.1');
    expect(context.userAgent).toBe('Mozilla/5.0 Test Browser');
    expect(context.requestId).toBe('req-123');
    expect(context.sessionId).toBe('sess-456');
  });

  it('uses socket remoteAddress when ip is undefined', () => {
    const req = createMockRequest({ ip: undefined });
    const context = extractContext(req);

    expect(context.ipAddress).toBe('192.168.1.1');
  });

  it('truncates long user agents', () => {
    const longUserAgent = 'A'.repeat(300);
    const req = createMockRequest({ headers: { 'user-agent': longUserAgent } });
    const context = extractContext(req);

    expect(context.userAgent.length).toBe(256);
  });

  it('handles missing headers gracefully', () => {
    const req = createMockRequest({ headers: {}, ip: undefined, socket: {} });
    const context = extractContext(req);

    expect(context.ipAddress).toBe('unknown');
    expect(context.userAgent).toBe('unknown');
  });
});
