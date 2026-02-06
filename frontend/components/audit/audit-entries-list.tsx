'use client';

import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { AuditTrailEntry } from '@/lib/api/onchain/types';

interface AuditEntriesListProps {
  entries: AuditTrailEntry[];
}

export function AuditEntriesList({ entries }: AuditEntriesListProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <FileText className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Audit Trail</h2>
        <span className="text-sm text-slate-400">({entries.length} entries)</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  entry.decision === 'approved' ? 'bg-teal-500/15 border-teal-500/30' :
                  entry.decision === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-amber-500/10 border-amber-500/30'
                }`}>
                  {entry.decision === 'approved' ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  ) : entry.decision === 'rejected' ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <span className="font-medium capitalize text-white">{entry.decision}</span>
                {entry.agentId && (
                  <span className="text-xs text-slate-400">Agent: {entry.agentId.slice(0, 8)}...</span>
                )}
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {entry.timestamp.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-2">{entry.reason}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span>Hash: <code className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{entry.hash.slice(0, 16)}...</code></span>
              <span>Proof: <code className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{entry.onChainProof.slice(0, 16)}...</code></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
