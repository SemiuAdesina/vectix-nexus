'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Send, Shield, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { getThreatFeed, detectThreat } from '@/lib/api/onchain';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';
import { ThreatFeedCard } from '@/components/threats/threat-feed-card';
import { DetectionStatsCard } from '@/components/threats/detection-stats-card';
import { ThreatReportForm } from '@/components/threats/threat-report-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const totalThreats = threats.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Threat Intelligence</h1>
              <p className="text-muted-foreground mt-1">Real-time threat detection and community reporting by VectixLogic</p>
            </div>
          </div>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={handleDetect}
            disabled={detecting}
            variant="outline"
            size="default"
            className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
          >
            {detecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Detecting...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 shrink-0" />
                Detect Anomaly
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowReport(!showReport)}
            variant="default"
            size="default"
            className="shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
          >
            <Send className="w-4 h-4 shrink-0" />
            Report Threat
          </Button>
        </div>
      </div>

      {lastDetection && (
        <div className={`rounded-2xl border p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)] ${
          lastDetection.isAnomaly ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              lastDetection.isAnomaly ? 'bg-destructive/10 border-destructive/30' : 'bg-primary/15 border-primary/30'
            }`}>
              {lastDetection.isAnomaly ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <Shield className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-foreground">
                  {lastDetection.isAnomaly ? 'Anomaly Detected' : 'No Threats Detected'}
                </span>
                {lastDetection.isAnomaly && (
                  <Badge variant="destructive" className="text-xs">
                    {lastDetection.confidence}% Confidence
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{lastDetection.reason}</p>
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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
          <div className="p-6 border-b border-border bg-secondary/20">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_8px_-2px_hsl(var(--primary)_/_0.2)]">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Threat Feed</h2>
                  <p className="text-sm text-muted-foreground">Real-time threat intelligence and community reports</p>
                </div>
                <div className="flex items-baseline gap-1.5 shrink-0 rounded-lg border border-primary/20 bg-card px-3 py-1.5">
                  <span className="text-lg font-bold tabular-nums text-primary">{totalThreats}</span>
                  <span className="text-xs text-muted-foreground font-medium">threats</span>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchThreats}
                disabled={loading}
                className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                aria-label="Refresh threat feed"
                title="Refresh threat feed"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <ThreatFeedCard threats={threats} />
          </div>
        </div>

        <div className="space-y-6">
          <DetectionStatsCard threats={threats} />

          <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">Common threat intelligence operations</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Button
                variant="outline"
                className="w-full justify-start border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                onClick={handleDetect}
                disabled={detecting}
              >
                <Activity className="w-4 h-4 mr-2 shrink-0" />
                Run Detection Scan
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                onClick={() => setShowReport(true)}
              >
                <Send className="w-4 h-4 mr-2 shrink-0" />
                Submit Threat Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                onClick={fetchThreats}
                disabled={loading}
              >
                <TrendingUp className="w-4 h-4 mr-2 shrink-0" />
                Refresh Feed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
