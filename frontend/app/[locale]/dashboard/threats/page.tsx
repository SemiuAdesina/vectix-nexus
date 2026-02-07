'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Send, Shield, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { getThreatFeed, detectThreat } from '@/lib/api/onchain';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';
import { ThreatFeedCard } from '@/components/threats/threat-feed-card';
import { DetectionStatsCard } from '@/components/threats/detection-stats-card';
import { ThreatReportForm } from '@/components/threats/threat-report-form';

export default function ThreatIntelligencePage() {
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<{ isAnomaly: boolean; confidence: number; reason: string } | null>(null);

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const data = await getThreatFeed(50);
      if (data.success) {
        setThreats(data.threats.map(t => ({ ...t, timestamp: new Date(t.timestamp) })));
      }
    } catch (error) {
      console.error('Failed to fetch threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    setDetecting(true);
    setLastDetection(null);
    try {
      const result = await detectThreat({ volume: 1000000, priceChange: 10 });
      if (result.success) {
        setLastDetection(result);
        if (result.isAnomaly) {
          fetchThreats();
        }
      }
    } catch (error) {
      console.error('Failed to detect threat:', error);
    } finally {
      setDetecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
      </div>
    );
  }

  const totalThreats = threats.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Threat Intelligence</h1>
              <p className="text-xs sm:text-base text-slate-400 mt-0.5 sm:mt-1">Real-time threat detection and community reporting by Vectix Foundry</p>
            </div>
          </div>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 transition-colors"
          >
            {detecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                Detecting...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Detect Anomaly
              </>
            )}
          </button>
          <button
            onClick={() => setShowReport(!showReport)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-500/20"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Report Threat
          </button>
        </div>
      </div>

      {lastDetection && (
        <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)] ${
          lastDetection.isAnomaly ? 'border-red-500/30 bg-red-500/5' : 'border-teal-500/30 bg-teal-500/5'
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border shrink-0 ${
              lastDetection.isAnomaly ? 'bg-red-500/10 border-red-500/30' : 'bg-teal-500/15 border-teal-500/30'
            }`}>
              {lastDetection.isAnomaly ? (
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              ) : (
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm sm:text-base font-semibold text-white">
                  {lastDetection.isAnomaly ? 'Anomaly Detected' : 'No Threats Detected'}
                </span>
                {lastDetection.isAnomaly && (
                  <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-medium">
                    {lastDetection.confidence}% Confidence
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400">{lastDetection.reason}</p>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <ThreatReportForm
          onClose={() => setShowReport(false)}
          onSuccess={() => {
            fetchThreats();
            setShowReport(false);
          }}
        />
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
          <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-semibold text-white">Threat Feed</h2>
                  <p className="text-[10px] sm:text-sm text-slate-400">Real-time threat intelligence and community reports</p>
                </div>
                <div className="flex items-baseline gap-1 sm:gap-1.5 shrink-0 rounded-md sm:rounded-lg border border-slate-700/50 bg-slate-800/50 px-2 sm:px-3 py-1 sm:py-1.5">
                  <span className="text-sm sm:text-lg font-bold tabular-nums text-teal-400">{totalThreats}</span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">threats</span>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchThreats}
                disabled={loading}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:bg-teal-500/10 hover:text-teal-400 transition-colors disabled:opacity-50"
                aria-label="Refresh threat feed"
                title="Refresh threat feed"
              >
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <ThreatFeedCard threats={threats} />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <DetectionStatsCard threats={threats} />

          <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-semibold text-white">Quick Actions</h2>
                <p className="text-[10px] sm:text-sm text-slate-400">Common threat intelligence operations</p>
              </div>
            </div>
            <div className="space-y-2 mt-3 sm:mt-4">
              <button
                type="button"
                onClick={handleDetect}
                disabled={detecting}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white disabled:opacity-50 flex items-center justify-start gap-1.5 sm:gap-2 transition-colors text-left"
              >
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Run Detection Scan
              </button>
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white flex items-center justify-start gap-1.5 sm:gap-2 transition-colors text-left"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Submit Threat Report
              </button>
              <button
                type="button"
                onClick={fetchThreats}
                disabled={loading}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white disabled:opacity-50 flex items-center justify-start gap-1.5 sm:gap-2 transition-colors text-left"
              >
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Refresh Feed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
