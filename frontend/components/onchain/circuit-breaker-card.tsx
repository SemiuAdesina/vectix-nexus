'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleString();
}
import { checkCircuitBreaker, resetCircuitBreaker, getCircuitBreakerState } from '@/lib/api/onchain';
import type { CircuitBreakerState } from '@/lib/api/onchain/types';

interface CircuitBreakerCardProps {
  agentId: string;
  state: CircuitBreakerState | null;
  onStateChange: () => void;
}

export function CircuitBreakerCard({ agentId, state: propState, onStateChange }: CircuitBreakerCardProps) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<CircuitBreakerState | null>(propState);

  const fetchState = useCallback(async () => {
    try {
      const data = await getCircuitBreakerState(agentId);
      if (data.success) {
        setState(data.state);
      }
    } catch (error) {
      console.error('Failed to fetch circuit breaker state:', error);
    }
  }, [agentId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleCheck = async () => {
    setLoading(true);
    try {
      await checkCircuitBreaker(agentId, {});
      await fetchState();
      onStateChange();
    } catch (error) {
      console.error('Failed to check circuit breaker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetCircuitBreaker(agentId);
      await fetchState();
      onStateChange();
    } catch (error) {
      console.error('Failed to reset circuit breaker:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    closed: 'text-teal-400',
    open: 'text-red-400',
    'half-open': 'text-amber-400',
  };

  const statusIcons = {
    closed: CheckCircle2,
    open: XCircle,
    'half-open': AlertTriangle,
  };

  if (!state) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <AlertTriangle className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="font-semibold text-white">Circuit Breaker</h3>
        </div>
        <p className="text-slate-400 text-sm">Circuit breaker not initialized</p>
      </div>
    );
  }

  const StatusIcon = statusIcons[state.status];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <StatusIcon className={`w-5 h-5 ${statusColors[state.status]}`} />
          </div>
          <h3 className="font-semibold text-white">Circuit Breaker</h3>
        </div>
        <span className={`text-sm font-medium capitalize ${statusColors[state.status]}`}>
          {state.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
          <span className="text-slate-400">Failure Count</span>
          <span className="text-white font-medium">{state.failureCount}</span>
        </div>
        {state.pausedUntil && (
          <div className="flex justify-between text-sm p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <span className="text-slate-400">Paused Until</span>
            <span className="text-white">{formatDate(state.pausedUntil)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
          <span className="text-slate-400">Last Reset</span>
          <span className="text-white">{formatDate(state.lastResetTime)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white disabled:opacity-50 transition-colors"
        >
          Check
        </button>
        {state.status === 'open' && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
