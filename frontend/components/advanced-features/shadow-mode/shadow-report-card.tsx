'use client';

import { Trophy } from 'lucide-react';
import { ReportCard } from '@/lib/api/advanced-features';

interface ShadowReportCardProps {
  report: ReportCard;
  onRestart: () => void;
  onBack?: () => void;
}

export function ShadowReportCard({ report, onRestart, onBack }: ShadowReportCardProps) {
  const { metrics, recommendation } = report;
  const isPositive = metrics.totalPnlSol >= 0;

  const recommendationStyles = {
    GO_LIVE: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30',
    CONTINUE_TESTING: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30',
    NEEDS_ADJUSTMENT: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${recommendationStyles[recommendation]}`}>
        <div className="flex items-start gap-2">
          <Trophy className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 space-y-1">
            <span className="font-semibold block text-sm sm:text-base">
              {recommendation.replace(/_/g, ' ')}
            </span>
            <p className="text-xs sm:text-sm opacity-80 break-words leading-relaxed">
              {report.summary}
            </p>
          </div>
        </div>
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

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 h-10 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-sm font-medium transition-all"
          >
            Back
          </button>
        )}
        <button
          onClick={onRestart}
          className={`h-10 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-sm font-medium transition-all ${
            onBack ? 'flex-1' : 'w-full'
          }`}
        >
          Start New Session
        </button>
      </div>
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
    <div className="bg-secondary/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${
        positive === undefined ? '' : positive ? 'text-[hsl(var(--success))]' : 'text-destructive'
      }`}>
        {value}
      </p>
    </div>
  );
}

