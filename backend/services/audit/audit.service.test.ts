import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  logAuditEvent,
  queryAuditLogs,
  extractContext,
  detectSuspiciousActivity,
} from './audit.service';
import { Request } from 'express';

const createMockRequest = (overrides = {}): Request => ({
  ip: '192.168.1.1',
  socket: { remoteAddress: '192.168.1.1' },
  headers: {
    'user-agent': 'TestAgent/1.0',
    'x-request-id': 'req-123',
  },
  ...overrides,
} as unknown as Request);

describe('extractContext', () => {
  it('extracts context from request', () => {
    const req = createMockRequest();
    const context = extractContext(req, 'user-123');

    expect(context.userId).toBe('user-123');
    expect(context.ipAddress).toBe('192.168.1.1');
    expect(context.userAgent).toBe('TestAgent/1.0');
    expect(context.requestId).toBe('req-123');
  });
});

describe('logAuditEvent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('logs audit event with correct severity', async () => {
    await logAuditEvent(
      'auth.login',
      { userId: 'user-123', ipAddress: '192.168.1.1' },
      { browser: 'Chrome' }
    );

    expect(console.info).toHaveBeenCalled();
  });

  it('logs critical events as warnings', async () => {
    await logAuditEvent(
      'wallet.withdraw_complete',
      { userId: 'user-123' },
      { amount: 100 }
    );

    expect(console.warn).toHaveBeenCalled();
  });

  it('redacts sensitive data', async () => {
    let capturedLog = '';
    vi.spyOn(console, 'info').mockImplementation((msg) => { capturedLog = msg; });
    
    await logAuditEvent(
      'api_key.create',
      { userId: 'user-123' },
      { apiKey: 'secret-key-123', name: 'My Key' }
    );

    expect(capturedLog).toContain('[REDACTED]');
    expect(capturedLog).not.toContain('secret-key-123');
  });
});

describe('queryAuditLogs', () => {
  beforeEach(async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    await logAuditEvent('auth.login', { userId: 'user-1' }, {});
    await logAuditEvent('auth.login', { userId: 'user-2' }, {});
    await logAuditEvent('auth.login_failed', { userId: 'user-1' }, {}, false);
  });

  it('filters by userId', async () => {
    const result = await queryAuditLogs({ userId: 'user-1' });
    expect(result.entries.every(e => e.context.userId === 'user-1')).toBe(true);
  });

  it('filters by action', async () => {
    const result = await queryAuditLogs({ action: 'auth.login_failed' });
    expect(result.entries.every(e => e.action === 'auth.login_failed')).toBe(true);
  });

  it('applies pagination', async () => {
    const result = await queryAuditLogs({ limit: 1, offset: 0 });
    expect(result.entries.length).toBeLessThanOrEqual(1);
  });
});

describe('detectSuspiciousActivity', () => {
  beforeEach(async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('detects multiple failed logins', async () => {
    for (let i = 0; i < 6; i++) {
      await logAuditEvent('auth.login_failed', { userId: 'suspicious-user' }, {}, false);
    }

    const result = detectSuspiciousActivity('suspicious-user');
    expect(result.suspicious).toBe(true);
    expect(result.reasons.some(r => r.includes('failed login'))).toBe(true);
  });

  it('returns clean for normal activity', () => {
    const result = detectSuspiciousActivity('normal-user');
    expect(result.suspicious).toBe(false);
    expect(result.reasons).toHaveLength(0);
  });
});
