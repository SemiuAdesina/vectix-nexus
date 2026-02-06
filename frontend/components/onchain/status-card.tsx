'use client';

import { Shield } from 'lucide-react';
import type { OnChainStatus } from '@/lib/api/onchain';

interface StatusCardProps {
  status: OnChainStatus | null;
}

export function StatusCard({ status }: StatusCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <Shield className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">System Status</h2>
      </div>

      {status && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <span className="text-sm text-slate-400">Status</span>
            <span className={`text-sm font-medium ${status.enabled ? 'text-teal-400' : 'text-red-400'}`}>
              {status.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <span className="text-sm text-slate-400">Message</span>
            <span className="text-sm text-white">{status.message}</span>
          </div>
          {status.programId && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="text-sm text-slate-400">Program ID</span>
              <span className="text-sm font-mono text-white truncate max-w-[200px]">{status.programId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
