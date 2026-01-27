'use client';

import { useState, useEffect } from 'react';
import { Layers, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { getNarrativeStatus, getNarrativeClusters, getNarrativeSignals } from '@/lib/api/advanced-features';
import type { NarrativeCluster, NarrativeSignal } from '@/lib/api/advanced-features';

export function NarrativeClustersCard() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [clusters, setClusters] = useState<NarrativeCluster[]>([]);
  const [signals, setSignals] = useState<NarrativeSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await getNarrativeStatus();
        setAvailable(status.available);
        if (status.available) {
          const [clustersData, signalsData] = await Promise.all([
            getNarrativeClusters(),
            getNarrativeSignals(),
          ]);
          setClusters(clustersData);
          setSignals(signalsData);
        }
      } catch (error) {
        console.error('Failed to fetch narrative data:', error);
        setAvailable(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!available) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Narrative Tracking</h3>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded">Coming Soon</span>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              Requires LunarCrush API key. Add <code className="text-xs bg-background px-1 rounded">LUNARCRUSH_API_KEY</code> to enable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Narrative Clusters</h3>
        </div>
        <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded">Live</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {clusters.slice(0, 6).map(cluster => (
          <ClusterCard key={cluster.id} cluster={cluster} />
        ))}
      </div>

      {signals.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-2">Active Signals</h4>
          {signals.slice(0, 3).map(signal => (
            <SignalItem key={signal.clusterId} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClusterCard({ cluster }: { cluster: NarrativeCluster }) {
  const isPositive = cluster.growthRate >= 0;
  return (
    <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{cluster.name}</span>
        <span className={`text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{cluster.growthRate.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{cluster.mentionCount.toLocaleString()} mentions</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>Heat: {cluster.heatScore}</span>
      </div>
    </div>
  );
}

function SignalItem({ signal }: { signal: NarrativeSignal }) {
  const Icon = signal.signalType === 'HEATING_UP' ? TrendingUp : TrendingDown;
  const color = signal.signalType === 'HEATING_UP' ? 'text-success' : 'text-destructive';
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm">{signal.message}</span>
    </div>
  );
}

