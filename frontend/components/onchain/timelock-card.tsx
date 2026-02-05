'use client';

import { useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { createTimeLock, cancelTimeLock } from '@/lib/api/onchain';
import type { TimeLockedTransaction } from '@/lib/api/onchain/types';

interface TimeLockCardProps {
  agentId: string;
}

export function TimeLockCard({ agentId }: TimeLockCardProps) {
  const [loading, setLoading] = useState(false);
  const [timelocks, setTimelocks] = useState<TimeLockedTransaction[]>([]);

  const handleCreateTimeLock = async () => {
    setLoading(true);
    try {
      const executeAt = new Date(Date.now() + 3600000);
      const result = await createTimeLock({
        agentId,
        type: 'trade',
        transactionData: {},
        executeAt,
        cancelWindow: 300000,
      });
      if (result.success) {
        setTimelocks([...timelocks, result.timelock]);
      }
    } catch (error) {
      console.error('Failed to create timelock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setLoading(true);
    try {
      await cancelTimeLock(id);
      setTimelocks(timelocks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to cancel timelock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Time-Locked Transactions</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Add delay before transaction execution for additional safety
        </p>

        <div className="space-y-2">
          {timelocks.map((timelock) => (
            <div key={timelock.id} className="p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize text-foreground">{timelock.type}</span>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                  timelock.status === 'executed' ? 'bg-primary/10 text-primary border-primary/20' :
                  timelock.status === 'pending' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' :
                  'bg-secondary text-muted-foreground border-border'
                }`}>
                  {timelock.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Execute at: {new Date(timelock.executeAt).toLocaleString()}
              </div>
              {timelock.status === 'pending' && (
                <button
                  onClick={() => handleCancel(timelock.id)}
                  className="mt-2 text-xs text-destructive hover:text-destructive/90 hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateTimeLock}
          disabled={loading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
          Create Time Lock
        </button>
      </div>
    </div>
  );
}
