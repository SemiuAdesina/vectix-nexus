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
  const [startingSol, setStartingSol] = useState(10);

  const handleStart = async () => {
    setLoading(true);
    try {
      const p = await createShadowPortfolio(agentId, startingSol);
      setPortfolio(p);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await stopShadowMode(agentId);
      const r = await getShadowReport(agentId);
      setReport(r);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async () => {
    setLoading(true);
    try {
      const r = await getShadowReport(agentId);
      setReport(r);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToActive = () => {
    setReport(null);
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">Shadow Mode</h3>
          <p className="text-xs text-muted-foreground truncate">
            Paper trading with live market data
          </p>
        </div>
      </div>

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
        <ShadowReportCard 
          report={report} 
          onRestart={handleStart}
          onBack={portfolio?.isActive ? handleBackToActive : undefined}
        />
      )}
    </div>
  );
}

