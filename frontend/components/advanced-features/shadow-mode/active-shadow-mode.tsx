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
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 shadow-[0_0_12px_-4px_rgba(20,184,166,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Current Value</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs text-teal-400 font-medium">Live</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-white">{portfolio.currentValueSol.toFixed(2)} SOL</p>
        <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
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
          className="h-10 rounded-lg border border-teal-500/30 bg-slate-800/80 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-sm font-medium transition-all disabled:opacity-50 text-white"
        >
          View Report
        </button>
        <button
          onClick={onStop}
          disabled={loading}
          className="h-10 rounded-lg bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 border border-red-500/30 transition-all disabled:opacity-50"
        >
          <Square className="w-3 h-3 shrink-0" />
          Stop
        </button>
      </div>
    </div>
  );
}
