'use client';

import { Trophy } from 'lucide-react';
import { ReportCard } from '@/lib/api/advanced-features';

interface ShadowReportCardProps {
  report: ReportCard;
  onRestart: () => void;
}

export function ShadowReportCard({ report, onRestart }: ShadowReportCardProps) {
  const { metrics, recommendation } = report;
  const isPositive = metrics.totalPnlSol >= 0;

  const recommendationStyles = {
    GO_LIVE: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    CONTINUE_TESTING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    NEEDS_ADJUSTMENT: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Session report from backend (live metrics).
      </p>
      <div className={`rounded-xl border p-4 ${recommendationStyles[recommendation]}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <Trophy className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-semibold text-white">
            {recommendation.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="text-sm text-slate-400">{report.summary}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricBox
          label="Total P&L"
          value={`${isPositive ? '+' : ''}${metrics.totalPnlSol.toFixed(2)} SOL`}
          positive={isPositive}
        />
        <MetricBox
          label="Win Rate"
          value={`${metrics.winRate.toFixed(0)}%`}
          positive={metrics.winRate >= 50}
        />
        <MetricBox
          label="Total Trades"
          value={metrics.totalTrades.toString()}
        />
        <MetricBox
          label="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          positive={metrics.sharpeRatio > 1}
        />
      </div>

      <button
        onClick={onRestart}
        className="w-full h-10 rounded-lg border border-teal-500/30 bg-slate-800/80 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-sm font-medium transition-all text-white"
      >
        Start New Session
      </button>
    </div>
  );
}

function MetricBox({
  label,
  value,
  positive
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 shadow-[0_0_8px_-2px_rgba(20,184,166,0.06)]">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-lg font-semibold text-white ${
        positive === undefined ? '' : positive ? 'text-teal-400' : 'text-red-400'
      }`}>
        {value}
      </p>
    </div>
  );
}
