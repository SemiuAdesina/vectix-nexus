import * as crypto from 'node:crypto';
import { onChainVerification } from './onchain-verification';
import type { AuditTrailEntry, AuditTrailQuery } from './onchain-types';

const AUDIT_TRAIL: AuditTrailEntry[] = [];

export class AuditTrailService {
  async logSecurityEvent(event: Omit<AuditTrailEntry, 'id' | 'timestamp' | 'onChainProof' | 'hash' | 'previousHash'>): Promise<AuditTrailEntry> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const previousHash = AUDIT_TRAIL.length > 0 ? AUDIT_TRAIL[AUDIT_TRAIL.length - 1].hash : null;
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify({ ...event, id, timestamp, previousHash }))
      .digest('hex');

    const onChainLog = await onChainVerification.storeSecurityDecision({
      id,
      type: 'audit_event',
      agentId: event.agentId,
      tokenAddress: event.tokenAddress,
      decision: event.decision,
      reason: event.reason,
      timestamp: timestamp.toISOString(),
      metadata: event.metadata,
    });

    const entry: AuditTrailEntry = {
      id,
      timestamp,
      previousHash,
      hash,
      onChainProof: onChainLog.onChainProof,
      agentId: event.agentId,
      tokenAddress: event.tokenAddress,
      decision: event.decision,
      reason: event.reason,
      metadata: event.metadata,
    };

    AUDIT_TRAIL.push(entry);
    return entry;
  }

  async queryTrail(query: AuditTrailQuery): Promise<{ entries: AuditTrailEntry[]; total: number }> {
    let filtered = [...AUDIT_TRAIL];

    if (query.agentId) filtered = filtered.filter(e => e.agentId === query.agentId);
    if (query.tokenAddress) filtered = filtered.filter(e => e.tokenAddress === query.tokenAddress);
    if (query.decision) filtered = filtered.filter(e => e.decision === query.decision);
    if (query.startDate) filtered = filtered.filter(e => e.timestamp >= query.startDate!);
    if (query.endDate) filtered = filtered.filter(e => e.timestamp <= query.endDate!);

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filtered.length;
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return { entries: filtered.slice(offset, offset + limit), total };
  }

  async verifyTrailIntegrity(): Promise<{ valid: boolean; invalidEntries: string[] }> {
    const invalidEntries: string[] = [];

    for (let i = 1; i < AUDIT_TRAIL.length; i++) {
      const current = AUDIT_TRAIL[i];
      const previous = AUDIT_TRAIL[i - 1];

      if (current.previousHash !== previous.hash) {
        invalidEntries.push(current.id);
      }

      const expectedHash = crypto.createHash('sha256')
        .update(JSON.stringify({
          id: current.id,
          timestamp: current.timestamp,
          previousHash: current.previousHash,
          agentId: current.agentId,
          tokenAddress: current.tokenAddress,
          decision: current.decision,
          reason: current.reason,
          metadata: current.metadata,
        }))
        .digest('hex');

      if (current.hash !== expectedHash) {
        invalidEntries.push(current.id);
      }
    }

    return { valid: invalidEntries.length === 0, invalidEntries };
  }

  async exportTrail(format: 'json' | 'csv'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(AUDIT_TRAIL, null, 2);
    }

    const headers = ['id', 'timestamp', 'agentId', 'tokenAddress', 'decision', 'reason', 'hash', 'onChainProof'];
    const rows = AUDIT_TRAIL.map(e => [
      e.id,
      e.timestamp.toISOString(),
      e.agentId || '',
      e.tokenAddress || '',
      e.decision,
      e.reason,
      e.hash,
      e.onChainProof,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const auditTrailService = new AuditTrailService();
