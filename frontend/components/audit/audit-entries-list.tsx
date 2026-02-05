'use client';

import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { AuditTrailEntry } from '@/lib/api/onchain/types';

interface AuditEntriesListProps {
  entries: AuditTrailEntry[];
}

export function AuditEntriesList({ entries }: AuditEntriesListProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Audit Trail</h2>
        <span className="text-sm text-muted-foreground">({entries.length} entries)</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  entry.decision === 'approved' ? 'bg-primary/15 border-primary/20' :
                  entry.decision === 'rejected' ? 'bg-destructive/10 border-destructive/20' :
                  'bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20'
                }`}>
                  {entry.decision === 'approved' ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : entry.decision === 'rejected' ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Clock className="w-4 h-4 text-[hsl(var(--warning))]" />
                  )}
                </div>
                <span className="font-medium capitalize text-foreground">{entry.decision}</span>
                {entry.agentId && (
                  <span className="text-xs text-muted-foreground">Agent: {entry.agentId.slice(0, 8)}...</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {entry.timestamp.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{entry.reason}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span>Hash: <code className="bg-background px-1.5 py-0.5 rounded border border-border">{entry.hash.slice(0, 16)}...</code></span>
              <span>Proof: <code className="bg-background px-1.5 py-0.5 rounded border border-border">{entry.onChainProof.slice(0, 16)}...</code></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
