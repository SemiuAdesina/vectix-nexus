'use client';

import { useState } from 'react';
import { Ghost } from 'lucide-react';
import { 
  createShadowPortfolio, 
  getShadowReport, 
  stopShadowMode, 
  ReportCard,
  ShadowPortfolio 
} from '@/lib/api/advanced-features';
import { StartShadowMode } from './start-shadow-mode';
import { ActiveShadowMode } from './active-shadow-mode';
import { ShadowReportCard } from './shadow-report-card';

interface ShadowModeCardProps {
  agentId: string;
}

export function ShadowModeCard({ agentId }: ShadowModeCardProps) {
  const [portfolio, setPortfolio] = useState<ShadowPortfolio | null>(null);
  const [report, setReport] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startingSol, setStartingSol] = useState(10);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await createShadowPortfolio(agentId, startingSol);
      setPortfolio(p);
      setReport(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start shadow mode');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    try {
      await stopShadowMode(agentId);
      const r = await getShadowReport(agentId);
      setReport(r);
      setPortfolio(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop or load report');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await getShadowReport(agentId);
      setReport(r ?? null);
      setPortfolio(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)]">
          <Ghost className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Shadow Mode</h3>
          <p className="text-xs text-muted-foreground">
            Paper trading with live market data
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {!portfolio && !report && (
        <StartShadowMode
          startingSol={startingSol}
          onStartingSolChange={setStartingSol}
          onStart={handleStart}
          loading={loading}
        />
      )}

      {portfolio && portfolio.isActive && !report && (
        <ActiveShadowMode
          portfolio={portfolio}
          onStop={handleStop}
          onViewReport={handleViewReport}
          loading={loading}
        />
      )}

      {report && (
        <div className="min-h-0">
          <ShadowReportCard report={report} onRestart={handleStart} />
        </div>
      )}
    </div>
  );
}

