'use client';

import { Shield } from 'lucide-react';
import type { OnChainStatus } from '@/lib/api/onchain';

interface StatusCardProps {
  status: OnChainStatus | null;
}

export function StatusCard({ status }: StatusCardProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">System Status</h2>
      </div>

      {status && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-card">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${status.enabled ? 'text-primary' : 'text-destructive'}`}>
              {status.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-card">
            <span className="text-sm text-muted-foreground">Message</span>
            <span className="text-sm text-foreground">{status.message}</span>
          </div>
          {status.programId && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-card">
              <span className="text-sm text-muted-foreground">Program ID</span>
              <span className="text-sm font-mono text-foreground truncate max-w-[200px]">{status.programId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
