import { prisma } from '../../lib/prisma';
import { logAuditEvent, extractContext } from '../audit';
import { Request } from 'express';

export interface LockoutConfig {
  maxFailedAttempts: number;
  lockoutDurationMs: number;
  resetWindowMs: number;
}

export interface LockoutStatus {
  isLocked: boolean;
  failedAttempts: number;
  lockoutEndsAt: Date | null;
  remainingAttempts: number;
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxFailedAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000,
  resetWindowMs: 60 * 60 * 1000,
};

const failedAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil: number | null }>();

export function checkLockoutStatus(identifier: string, config = DEFAULT_CONFIG): LockoutStatus {
  const now = Date.now();
  const record = failedAttempts.get(identifier);

  if (!record) {
    return {
      isLocked: false,
      failedAttempts: 0,
      lockoutEndsAt: null,
      remainingAttempts: config.maxFailedAttempts,
    };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      isLocked: true,
      failedAttempts: record.count,
      lockoutEndsAt: new Date(record.lockedUntil),
      remainingAttempts: 0,
    };
  }

  if (record.firstAttempt + config.resetWindowMs < now) {
    failedAttempts.delete(identifier);
    return {
      isLocked: false,
      failedAttempts: 0,
      lockoutEndsAt: null,
      remainingAttempts: config.maxFailedAttempts,
    };
  }

  return {
    isLocked: false,
    failedAttempts: record.count,
    lockoutEndsAt: null,
    remainingAttempts: Math.max(0, config.maxFailedAttempts - record.count),
  };
}

export async function recordFailedAttempt(
  identifier: string,
  req?: Request,
  config = DEFAULT_CONFIG
): Promise<LockoutStatus> {
  const now = Date.now();
  const record = failedAttempts.get(identifier) || { count: 0, firstAttempt: now, lockedUntil: null };

  if (record.firstAttempt + config.resetWindowMs < now) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = null;
  } else {
    record.count++;
  }

  if (record.count >= config.maxFailedAttempts) {
    record.lockedUntil = now + config.lockoutDurationMs;

    if (req) {
      const context = extractContext(req);
      await logAuditEvent(
        'auth.login_failed',
        context,
        { reason: 'Account locked due to excessive failed attempts', attempts: record.count },
        false,
        'Account locked'
      );
    }
  }

  failedAttempts.set(identifier, record);
  return checkLockoutStatus(identifier, config);
}

export function resetLockout(identifier: string): void {
  failedAttempts.delete(identifier);
}

export async function recordSuccessfulAuth(identifier: string): Promise<void> {
  resetLockout(identifier);
}

export function cleanupExpiredLockouts(config = DEFAULT_CONFIG): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of failedAttempts.entries()) {
    const expired = record.firstAttempt + config.resetWindowMs < now;
    const lockoutExpired = record.lockedUntil && record.lockedUntil < now;

    if (expired || lockoutExpired) {
      failedAttempts.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}
