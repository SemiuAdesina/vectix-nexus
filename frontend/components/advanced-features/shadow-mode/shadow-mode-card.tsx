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
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
          <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-white">Shadow Mode</h3>
          <p className="text-[10px] sm:text-xs text-slate-400">Paper trading with live market data</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg sm:rounded-xl border border-red-500/30 bg-red-500/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-400 mb-3 sm:mb-4">
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
