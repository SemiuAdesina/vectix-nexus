import { describe, it, expect, beforeEach } from 'vitest';
import * as amlUtils from './aml-transaction.utils';
import type { TransactionRecord } from './aml-monitoring.service';

describe('aml-transaction.utils', () => {
  beforeEach(() => {
    amlUtils.clearTransactionHistory('user1');
  });

  describe('recordTransaction', () => {
    it('records transaction', () => {
      const record: TransactionRecord = {
        userId: 'user1',
        amount: 1000,
        timestamp: Date.now(),
        type: 'withdrawal',
      };
      amlUtils.recordTransaction(record);
      const history = amlUtils.getTransactionHistory('user1');
      expect(history).toHaveLength(1);
      expect(history[0].amount).toBe(1000);
    });

    it('limits history to 1000 entries', () => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < 1001; i++) {
        amlUtils.recordTransaction({
          userId: 'user1',
          amount: 100,
          timestamp: thirtyDaysAgo + i * 1000,
          type: 'withdrawal',
        });
      }
      const history = amlUtils.getTransactionHistory('user1');
      expect(history.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('getTransactionHistory', () => {
    it('returns empty array for new user', () => {
      const history = amlUtils.getTransactionHistory('newuser');
      expect(history).toEqual([]);
    });
  });

  describe('clearTransactionHistory', () => {
    it('clears transaction history', () => {
      amlUtils.recordTransaction({
        userId: 'user1',
        amount: 100,
        timestamp: Date.now(),
        type: 'withdrawal',
      });
      amlUtils.clearTransactionHistory('user1');
      const history = amlUtils.getTransactionHistory('user1');
      expect(history).toEqual([]);
    });
  });

  describe('calculatePeriodTotal', () => {
    it('calculates total for period', () => {
      const now = Date.now();
      amlUtils.recordTransaction({
        userId: 'user1',
        amount: 100,
        timestamp: now - 1000,
        type: 'withdrawal',
      });
      amlUtils.recordTransaction({
        userId: 'user1',
        amount: 200,
        timestamp: now - 2000,
        type: 'withdrawal',
      });
      amlUtils.recordTransaction({
        userId: 'user1',
        amount: 50,
        timestamp: now - 100000,
        type: 'withdrawal',
      });

      const history = amlUtils.getTransactionHistory('user1');
      const total = amlUtils.calculatePeriodTotal(history, 5000);
      expect(total).toBe(300);
    });
  });

  describe('detectStructuring', () => {
    it('detects structuring pattern', () => {
      const now = Date.now();
      const history: TransactionRecord[] = [
        { userId: 'user1', amount: 9500, timestamp: now - 1000, type: 'withdrawal' },
        { userId: 'user1', amount: 9800, timestamp: now - 2000, type: 'withdrawal' },
        { userId: 'user1', amount: 9200, timestamp: now - 3000, type: 'withdrawal' },
      ];

      const result = amlUtils.detectStructuring(history, 10000);
      expect(result.detected).toBe(true);
      expect(result.pattern).toContain('3 transactions');
    });

    it('returns not detected when pattern not found', () => {
      const history: TransactionRecord[] = [
        { userId: 'user1', amount: 5000, timestamp: Date.now() - 1000, type: 'withdrawal' },
      ];

      const result = amlUtils.detectStructuring(history, 10000);
      expect(result.detected).toBe(false);
    });
  });
});
