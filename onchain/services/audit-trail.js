"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTrailService = exports.AuditTrailService = void 0;
const crypto = __importStar(require("node:crypto"));
const onchain_verification_1 = require("./onchain-verification");
const AUDIT_TRAIL = [];
class AuditTrailService {
    async logSecurityEvent(event) {
        const id = crypto.randomUUID();
        const timestamp = new Date();
        const previousHash = AUDIT_TRAIL.length > 0 ? AUDIT_TRAIL[AUDIT_TRAIL.length - 1].hash : null;
        const hash = crypto.createHash('sha256')
            .update(JSON.stringify({ ...event, id, timestamp, previousHash }))
            .digest('hex');
        const onChainLog = await onchain_verification_1.onChainVerification.storeSecurityDecision({
            id,
            type: 'audit_event',
            agentId: event.agentId,
            tokenAddress: event.tokenAddress,
            decision: event.decision,
            reason: event.reason,
            timestamp: timestamp.toISOString(),
            metadata: event.metadata,
        });
        const entry = {
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
    async queryTrail(query) {
        let filtered = [...AUDIT_TRAIL];
        if (query.agentId)
            filtered = filtered.filter(e => e.agentId === query.agentId);
        if (query.tokenAddress)
            filtered = filtered.filter(e => e.tokenAddress === query.tokenAddress);
        if (query.decision)
            filtered = filtered.filter(e => e.decision === query.decision);
        if (query.startDate)
            filtered = filtered.filter(e => e.timestamp >= query.startDate);
        if (query.endDate)
            filtered = filtered.filter(e => e.timestamp <= query.endDate);
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const total = filtered.length;
        const offset = query.offset || 0;
        const limit = query.limit || 100;
        return { entries: filtered.slice(offset, offset + limit), total };
    }
    async verifyTrailIntegrity() {
        const invalidEntries = [];
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
    async exportTrail(format) {
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
exports.AuditTrailService = AuditTrailService;
exports.auditTrailService = new AuditTrailService();
