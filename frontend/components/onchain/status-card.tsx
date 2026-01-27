'use client';

import { Shield } from 'lucide-react';
import type { OnChainStatus } from '@/lib/api/onchain';

interface StatusCardProps {
  status: OnChainStatus | null;
}

export function StatusCard({ status }: StatusCardProps) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">System Status</h2>
      </div>
      
      {status && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${status.enabled ? 'text-success' : 'text-destructive'}`}>
              {status.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Message</span>
            <span className="text-sm">{status.message}</span>
          </div>
          {status.programId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Program ID</span>
              <span className="text-sm font-mono">{status.programId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
