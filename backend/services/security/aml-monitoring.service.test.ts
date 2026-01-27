import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkAmlCompliance,
  recordTransaction,
  getTransactionHistory,
  clearTransactionHistory,
} from './aml-monitoring.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {},
}));

vi.mock('../audit', () => ({
  logAuditEvent: vi.fn(),
  extractContext: vi.fn(() => ({})),
}));

const testThresholds = {
  singleTransactionLimit: 1000,
  dailyLimit: 5000,
  weeklyLimit: 20000,
  monthlyLimit: 50000,
  velocityWindowMs: 60000,
  maxTransactionsPerWindow: 5,
};

describe('checkAmlCompliance', () => {
  beforeEach(() => {
    clearTransactionHistory('test-user');
  });

  it('allows transactions under limits', async () => {
    const result = await checkAmlCompliance('test-user', 100, 'withdrawal', testThresholds);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Transaction approved');
  });

  it('blocks transactions exceeding single limit', async () => {
    const result = await checkAmlCompliance('test-user', 1500, 'withdrawal', testThresholds);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('single transaction limit');
  });

  it('flags transactions requiring CTR', async () => {
    const result = await checkAmlCompliance('test-user', 10000, 'deposit', {
      ...testThresholds,
      singleTransactionLimit: 50000,
    });
    expect(result.flags).toContain('CTR_REQUIRED');
    expect(result.requiresReview).toBe(true);
  });

  it('blocks when velocity limit exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      recordTransaction({ userId: 'test-user', amount: 100, timestamp: Date.now(), type: 'withdrawal' });
    }
    const result = await checkAmlCompliance('test-user', 100, 'withdrawal', testThresholds);
    expect(result.allowed).toBe(false);
    expect(result.flags).toContain('VELOCITY_EXCEEDED');
  });

  it('blocks when daily limit exceeded', async () => {
    recordTransaction({ userId: 'test-user', amount: 4500, timestamp: Date.now(), type: 'withdrawal' });
    const result = await checkAmlCompliance('test-user', 600, 'withdrawal', testThresholds);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Daily transaction limit');
  });
});

describe('recordTransaction', () => {
  beforeEach(() => {
    clearTransactionHistory('test-user');
  });

  it('records transaction to history', () => {
    recordTransaction({ userId: 'test-user', amount: 100, timestamp: Date.now(), type: 'deposit' });
    const history = getTransactionHistory('test-user');
    expect(history.length).toBe(1);
    expect(history[0].amount).toBe(100);
  });

  it('maintains transaction history', () => {
    recordTransaction({ userId: 'test-user', amount: 100, timestamp: Date.now(), type: 'deposit' });
    recordTransaction({ userId: 'test-user', amount: 200, timestamp: Date.now(), type: 'withdrawal' });
    const history = getTransactionHistory('test-user');
    expect(history.length).toBe(2);
  });
});

describe('getTransactionHistory', () => {
  it('returns empty array for unknown user', () => {
    const history = getTransactionHistory('unknown-user');
    expect(history).toEqual([]);
  });
});

describe('clearTransactionHistory', () => {
  it('clears user transaction history', () => {
    recordTransaction({ userId: 'test-user', amount: 100, timestamp: Date.now(), type: 'deposit' });
    clearTransactionHistory('test-user');
    const history = getTransactionHistory('test-user');
    expect(history.length).toBe(0);
  });
});
