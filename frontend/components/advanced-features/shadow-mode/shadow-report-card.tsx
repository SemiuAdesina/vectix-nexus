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
    GO_LIVE: 'bg-primary/10 text-primary border-primary/30',
    CONTINUE_TESTING: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30',
    NEEDS_ADJUSTMENT: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Session report from backend (live metrics).
      </p>
      <div className={`rounded-xl border p-4 ${recommendationStyles[recommendation]}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">
            {recommendation.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{report.summary}</p>
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
        className="w-full h-10 rounded-lg border border-primary/30 bg-secondary/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary text-sm font-medium transition-all text-foreground"
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
    <div className="rounded-xl border border-primary/20 bg-card p-3 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.06)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold text-foreground ${
        positive === undefined ? '' : positive ? 'text-primary' : 'text-destructive'
      }`}>
        {value}
      </p>
    </div>
  );
}

