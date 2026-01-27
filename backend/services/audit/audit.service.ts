import crypto from 'node:crypto';
import {
  AuditAction,
  AuditContext,
  AuditMetadata,
  AuditEntry,
  AuditQueryParams,
} from './audit.types';
import { ACTION_SEVERITY_MAP, MAX_MEMORY_ENTRIES, SECURITY_ACTIONS } from './audit.config';
import { redactSensitiveData } from './audit.utils';

const AUDIT_LOG: AuditEntry[] = [];

export async function logAuditEvent(
  action: AuditAction,
  context: AuditContext,
  metadata: AuditMetadata = {},
  success = true,
  errorMessage?: string
): Promise<void> {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    action,
    severity: ACTION_SEVERITY_MAP[action] || 'info',
    context,
    metadata: redactSensitiveData(metadata) as AuditMetadata,
    success,
    errorMessage: errorMessage?.substring(0, 500),
  };

  AUDIT_LOG.push(entry);

  if (AUDIT_LOG.length > MAX_MEMORY_ENTRIES) {
    AUDIT_LOG.splice(0, 1000);
  }

  const logLevel = entry.severity === 'critical' ? 'warn' : 'info';
  console[logLevel](JSON.stringify({
    type: 'audit',
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }));
}

export async function queryAuditLogs(params: AuditQueryParams): Promise<{
  entries: AuditEntry[];
  total: number;
}> {
  let filtered = [...AUDIT_LOG];

  if (params.userId) filtered = filtered.filter(e => e.context.userId === params.userId);
  if (params.action) filtered = filtered.filter(e => e.action === params.action);
  if (params.severity) filtered = filtered.filter(e => e.severity === params.severity);
  if (params.startDate) filtered = filtered.filter(e => e.timestamp >= params.startDate!);
  if (params.endDate) filtered = filtered.filter(e => e.timestamp <= params.endDate!);

  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const total = filtered.length;
  const offset = params.offset || 0;
  const limit = params.limit || 100;

  return { entries: filtered.slice(offset, offset + limit), total };
}

export function getRecentSecurityEvents(userId: string, limit = 10): AuditEntry[] {
  return AUDIT_LOG
    .filter(e => e.context.userId === userId && SECURITY_ACTIONS.includes(e.action))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function detectSuspiciousActivity(userId: string): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const oneHourAgo = new Date(Date.now() - 3600000);
  const recentEvents = AUDIT_LOG.filter(
    e => e.context.userId === userId && e.timestamp >= oneHourAgo
  );

  const failedLogins = recentEvents.filter(e => e.action === 'auth.login_failed').length;
  if (failedLogins >= 5) reasons.push(`${failedLogins} failed login attempts in the last hour`);

  const withdrawRequests = recentEvents.filter(e => e.action === 'wallet.withdraw_request').length;
  if (withdrawRequests >= 3) reasons.push(`${withdrawRequests} withdrawal requests in the last hour`);

  const uniqueIps = new Set(recentEvents.map(e => e.context.ipAddress)).size;
  if (uniqueIps >= 5) reasons.push(`Activity from ${uniqueIps} different IP addresses`);

  return { suspicious: reasons.length > 0, reasons };
}

export { extractContext } from './audit.utils';
