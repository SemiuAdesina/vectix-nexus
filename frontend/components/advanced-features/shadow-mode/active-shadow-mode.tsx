'use client';

import { Square, TrendingUp, TrendingDown } from 'lucide-react';
import { ShadowPortfolio } from '@/lib/api/advanced-features';

interface ActiveShadowModeProps {
  portfolio: ShadowPortfolio;
  onStop: () => void;
  onViewReport: () => void;
  loading: boolean;
}

export function ActiveShadowMode({ 
  portfolio, 
  onStop, 
  onViewReport,
  loading 
}: ActiveShadowModeProps) {
  const pnl = portfolio.currentValueSol - portfolio.startingSol;
  const pnlPercent = (pnl / portfolio.startingSol) * 100;
  const isPositive = pnl >= 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-card p-4 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.08)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Current Value</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Live</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{portfolio.currentValueSol.toFixed(2)} SOL</p>
        <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 shrink-0" /> : <TrendingDown className="w-4 h-4 shrink-0" />}
          <span className="text-sm font-medium">
            {isPositive ? '+' : ''}{pnl.toFixed(2)} SOL ({pnlPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onViewReport}
          disabled={loading}
          className="h-10 rounded-lg border border-primary/30 bg-secondary/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary text-sm font-medium transition-all disabled:opacity-50 text-foreground"
        >
          View Report
        </button>
        <button
          onClick={onStop}
          disabled={loading}
          className="h-10 rounded-lg bg-destructive text-destructive-foreground font-medium flex items-center justify-center gap-2 hover:bg-destructive/90 transition-all disabled:opacity-50"
        >
          <Square className="w-3 h-3 shrink-0" />
          Stop
        </button>
      </div>
    </div>
  );
}

