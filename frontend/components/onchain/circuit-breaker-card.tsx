'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
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

  if (!state) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Circuit Breaker</h3>
        </div>
        <p className="text-muted-foreground text-sm">Circuit breaker not initialized</p>
      </div>
    );
  }

  const statusColors = {
    closed: 'text-primary',
    open: 'text-destructive',
    'half-open': 'text-[hsl(var(--warning))]',
  };

  const statusIcons = {
    closed: CheckCircle2,
    open: XCircle,
    'half-open': AlertTriangle,
  };

  const StatusIcon = statusIcons[state.status];

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
            <StatusIcon className={`w-5 h-5 ${statusColors[state.status]}`} />
          </div>
          <h3 className="font-semibold text-foreground">Circuit Breaker</h3>
        </div>
        <span className={`text-sm font-medium capitalize ${statusColors[state.status]}`}>
          {state.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm p-3 rounded-xl border border-primary/20 bg-card">
          <span className="text-muted-foreground">Failure Count</span>
          <span className="text-foreground font-medium">{state.failureCount}</span>
        </div>
        {state.pausedUntil && (
          <div className="flex justify-between text-sm p-3 rounded-xl border border-primary/20 bg-card">
            <span className="text-muted-foreground">Paused Until</span>
            <span className="text-foreground">{new Date(state.pausedUntil).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm p-3 rounded-xl border border-primary/20 bg-card">
          <span className="text-muted-foreground">Last Reset</span>
          <span className="text-foreground">{new Date(state.lastResetTime).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-primary/30 rounded-lg hover:bg-primary/10 hover:border-primary/50 hover:text-primary text-foreground disabled:opacity-50 transition-colors"
        >
          Check
        </button>
        {state.status === 'open' && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
