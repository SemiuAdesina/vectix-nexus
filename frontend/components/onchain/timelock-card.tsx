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
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Time-Locked Transactions</h3>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>Add delay before transaction execution for additional safety</p>
        </div>

        <div className="space-y-2">
          {timelocks.map((timelock) => (
            <div key={timelock.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{timelock.type}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  timelock.status === 'executed' ? 'bg-success/10 text-success' :
                  timelock.status === 'pending' ? 'bg-warning/10 text-warning' :
                  'bg-secondary text-muted-foreground'
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
                  className="mt-2 text-xs text-destructive hover:underline"
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
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
          Create Time Lock
        </button>
      </div>
    </div>
  );
}
