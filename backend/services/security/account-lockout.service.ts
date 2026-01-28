import { logAuditEvent, extractContext } from '../audit';
import { Request } from 'express';
import { getStateStorage, LockoutRecord } from '../../lib/state-storage';

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

export async function checkLockoutStatus(identifier: string, config = DEFAULT_CONFIG): Promise<LockoutStatus> {
  const storage = getStateStorage();
  const now = Date.now();
  const record = await storage.getLockout(identifier);

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
    await storage.deleteLockout(identifier);
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
  const storage = getStateStorage();
  const now = Date.now();
  let record = await storage.getLockout(identifier);

  if (!record) {
    record = { count: 0, firstAttempt: now, lockedUntil: null };
  }

  if (record.firstAttempt + config.resetWindowMs < now) {
    record = { count: 1, firstAttempt: now, lockedUntil: null };
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

  await storage.setLockout(identifier, record);
  return checkLockoutStatus(identifier, config);
}

export async function resetLockout(identifier: string): Promise<void> {
  const storage = getStateStorage();
  await storage.deleteLockout(identifier);
}

export async function recordSuccessfulAuth(identifier: string): Promise<void> {
  await resetLockout(identifier);
}

export async function cleanupExpiredLockouts(config = DEFAULT_CONFIG): Promise<number> {
  const storage = getStateStorage();
  return storage.cleanupExpiredLockouts(config.resetWindowMs);
}
