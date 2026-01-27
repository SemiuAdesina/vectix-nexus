import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkLockoutStatus,
  recordFailedAttempt,
  resetLockout,
  recordSuccessfulAuth,
  cleanupExpiredLockouts,
} from './account-lockout.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {},
}));

vi.mock('../audit', () => ({
  logAuditEvent: vi.fn(),
  extractContext: vi.fn(() => ({})),
}));

const testConfig = {
  maxFailedAttempts: 3,
  lockoutDurationMs: 5000,
  resetWindowMs: 10000,
};

describe('checkLockoutStatus', () => {
  beforeEach(() => {
    resetLockout('test-user');
  });

  it('returns not locked for new user', () => {
    const status = checkLockoutStatus('new-user', testConfig);
    expect(status.isLocked).toBe(false);
    expect(status.failedAttempts).toBe(0);
    expect(status.remainingAttempts).toBe(3);
  });

  it('tracks failed attempts', async () => {
    await recordFailedAttempt('test-user', undefined, testConfig);
    const status = checkLockoutStatus('test-user', testConfig);
    expect(status.failedAttempts).toBe(1);
    expect(status.remainingAttempts).toBe(2);
  });
});

describe('recordFailedAttempt', () => {
  beforeEach(() => {
    resetLockout('test-user');
  });

  it('locks account after max failed attempts', async () => {
    for (let i = 0; i < 3; i++) {
      await recordFailedAttempt('test-user', undefined, testConfig);
    }
    const status = checkLockoutStatus('test-user', testConfig);
    expect(status.isLocked).toBe(true);
    expect(status.lockoutEndsAt).not.toBeNull();
  });

  it('returns updated status after each attempt', async () => {
    const status1 = await recordFailedAttempt('test-user', undefined, testConfig);
    expect(status1.failedAttempts).toBe(1);

    const status2 = await recordFailedAttempt('test-user', undefined, testConfig);
    expect(status2.failedAttempts).toBe(2);
  });
});

describe('resetLockout', () => {
  it('clears lockout status', async () => {
    await recordFailedAttempt('test-user', undefined, testConfig);
    resetLockout('test-user');
    const status = checkLockoutStatus('test-user', testConfig);
    expect(status.failedAttempts).toBe(0);
  });
});

describe('recordSuccessfulAuth', () => {
  it('resets failed attempts on success', async () => {
    await recordFailedAttempt('test-user', undefined, testConfig);
    await recordSuccessfulAuth('test-user');
    const status = checkLockoutStatus('test-user', testConfig);
    expect(status.failedAttempts).toBe(0);
  });
});

describe('cleanupExpiredLockouts', () => {
  beforeEach(() => {
    resetLockout('test-user-1');
    resetLockout('test-user-2');
  });

  it('returns count of cleaned entries', () => {
    const cleaned = cleanupExpiredLockouts(testConfig);
    expect(typeof cleaned).toBe('number');
  });
});
