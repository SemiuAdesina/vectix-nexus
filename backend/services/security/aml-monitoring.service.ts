import { prisma } from '../../lib/prisma';
import { logAuditEvent, extractContext } from '../audit';
import { Request } from 'express';
import {
  recordTransaction,
  getTransactionHistory,
  clearTransactionHistory,
  calculatePeriodTotal,
  detectStructuring,
} from './aml-transaction.utils';

export interface AmlThresholds {
  singleTransactionLimit: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  velocityWindowMs: number;
  maxTransactionsPerWindow: number;
}

export interface TransactionRecord {
  userId: string;
  amount: number;
  timestamp: number;
  type: 'deposit' | 'withdrawal' | 'trade';
}

export interface AmlCheckResult {
  allowed: boolean;
  reason: string;
  requiresReview: boolean;
  flags: string[];
}

const BSA_REPORTING_THRESHOLD = 10000;
const SAR_STRUCTURING_THRESHOLD = 3000;

const DEFAULT_THRESHOLDS: AmlThresholds = {
  singleTransactionLimit: 50000,
  dailyLimit: 100000,
  weeklyLimit: 500000,
  monthlyLimit: 1000000,
  velocityWindowMs: 60 * 60 * 1000,
  maxTransactionsPerWindow: 10,
};

function createBlockedResult(reason: string, flags: string[]): AmlCheckResult {
  return { allowed: false, reason, requiresReview: true, flags };
}

export async function checkAmlCompliance(
  userId: string,
  amount: number,
  type: TransactionRecord['type'],
  thresholds = DEFAULT_THRESHOLDS,
  req?: Request
): Promise<AmlCheckResult> {
  const flags: string[] = [];
  const now = Date.now();
  const userHistory = getTransactionHistory(userId);

  if (amount >= BSA_REPORTING_THRESHOLD) {
    flags.push('CTR_REQUIRED');
  }

  if (amount >= thresholds.singleTransactionLimit) {
    return createBlockedResult('Transaction exceeds single transaction limit', flags);
  }

  const windowStart = now - thresholds.velocityWindowMs;
  const recentTransactions = userHistory.filter(t => t.timestamp > windowStart);

  if (recentTransactions.length >= thresholds.maxTransactionsPerWindow) {
    flags.push('VELOCITY_EXCEEDED');
    return createBlockedResult('Transaction velocity limit exceeded', flags);
  }

  const structuringCheck = detectStructuring(userHistory, SAR_STRUCTURING_THRESHOLD);
  if (structuringCheck.detected) {
    flags.push('STRUCTURING_SUSPECTED');
    if (req) {
      const context = extractContext(req);
      await logAuditEvent(
        'security.sanctions_check',
        { ...context, userId },
        { type: 'structuring_detected', pattern: structuringCheck.pattern },
        false,
        'Potential structuring activity detected'
      );
    }
  }

  const dailyTotal = calculatePeriodTotal(userHistory, 24 * 60 * 60 * 1000) + amount;
  if (dailyTotal > thresholds.dailyLimit) {
    return createBlockedResult('Daily transaction limit exceeded', flags);
  }

  const weeklyTotal = calculatePeriodTotal(userHistory, 7 * 24 * 60 * 60 * 1000) + amount;
  if (weeklyTotal > thresholds.weeklyLimit) {
    return createBlockedResult('Weekly transaction limit exceeded', flags);
  }

  const monthlyTotal = calculatePeriodTotal(userHistory, 30 * 24 * 60 * 60 * 1000) + amount;
  if (monthlyTotal > thresholds.monthlyLimit) {
    return createBlockedResult('Monthly transaction limit exceeded', flags);
  }

  recordTransaction({ userId, amount, timestamp: now, type });

  return {
    allowed: true,
    reason: 'Transaction approved',
    requiresReview: flags.includes('CTR_REQUIRED'),
    flags,
  };
}

export { recordTransaction, getTransactionHistory, clearTransactionHistory };
