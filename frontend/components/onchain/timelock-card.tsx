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
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <Clock className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="font-semibold text-white">Time-Locked Transactions</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          Add delay before transaction execution for additional safety
        </p>

        <div className="space-y-2">
          {timelocks.map((timelock) => (
            <div key={timelock.id} className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize text-white">{timelock.type}</span>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                  timelock.status === 'executed' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                  timelock.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {timelock.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Execute at: {new Date(timelock.executeAt).toLocaleString()}
              </div>
              {timelock.status === 'pending' && (
                <button
                  onClick={() => handleCancel(timelock.id)}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 hover:underline"
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
          className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
          Create Time Lock
        </button>
      </div>
    </div>
  );
}
