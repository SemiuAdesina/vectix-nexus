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

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Ghost className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Shadow Mode</h3>
          <p className="text-xs text-muted-foreground">
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

      {portfolio && portfolio.isActive && (
        <ActiveShadowMode
          portfolio={portfolio}
          onStop={handleStop}
          onViewReport={handleViewReport}
          loading={loading}
        />
      )}

      {report && <ShadowReportCard report={report} onRestart={handleStart} />}
    </div>
  );
}

