'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Send, Shield, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { getThreatFeed, detectThreat } from '@/lib/api/onchain';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';
import { ThreatFeedCard } from '@/components/threats/threat-feed-card';
import { DetectionStatsCard } from '@/components/threats/detection-stats-card';
import { ThreatReportForm } from '@/components/threats/threat-report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Threat Intelligence</h1>
              <p className="text-muted-foreground mt-1">Real-time threat detection and community reporting by VectixLogic</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDetect}
            disabled={detecting}
            variant="outline"
            size="default"
          >
            {detecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Detect Anomaly
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowReport(!showReport)}
            variant="default"
            size="default"
          >
            <Send className="w-4 h-4" />
            Report Threat
          </Button>
        </div>
      </div>

      {lastDetection && (
        <Card className={lastDetection.isAnomaly ? 'border-destructive/50 bg-destructive/5' : 'border-success/50 bg-success/5'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {lastDetection.isAnomaly ? (
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              ) : (
                <Shield className="w-5 h-5 text-success mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
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
          </CardContent>
        </Card>
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
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <CardTitle>Threat Feed</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {totalThreats}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchThreats}
                disabled={loading}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>Real-time threat intelligence and community reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ThreatFeedCard threats={threats} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <DetectionStatsCard threats={threats} />
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>Common threat intelligence operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDetect}
                disabled={detecting}
              >
                <Activity className="w-4 h-4 mr-2" />
                Run Detection Scan
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowReport(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Threat Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={fetchThreats}
                disabled={loading}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Feed
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
