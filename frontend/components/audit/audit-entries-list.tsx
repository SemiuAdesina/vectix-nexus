'use client';

import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { AuditTrailEntry } from '@/lib/api/onchain/types';

interface AuditEntriesListProps {
  entries: AuditTrailEntry[];
}

export function AuditEntriesList({ entries }: AuditEntriesListProps) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Audit Trail</h2>
        <span className="text-sm text-muted-foreground">({entries.length} entries)</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {entry.decision === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : entry.decision === 'rejected' ? (
                  <XCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <Clock className="w-4 h-4 text-warning" />
                )}
                <span className="font-medium capitalize">{entry.decision}</span>
                {entry.agentId && (
                  <span className="text-xs text-muted-foreground">Agent: {entry.agentId.slice(0, 8)}...</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {entry.timestamp.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{entry.reason}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Hash: <code className="bg-background px-1 rounded">{entry.hash.slice(0, 16)}...</code></span>
              <span>Proof: <code className="bg-background px-1 rounded">{entry.onChainProof.slice(0, 16)}...</code></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
