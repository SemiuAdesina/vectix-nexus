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
      <div className="rounded-2xl border border-primary/20 bg-card p-6 flex items-center justify-center h-48 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!available) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Narrative Tracking</h3>
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg">Coming Soon</span>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Requires LunarCrush API key. Add <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">LUNARCRUSH_API_KEY</code> to enable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)]">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Narrative Clusters</h3>
        </div>
        <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg font-medium">Live</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {clusters.slice(0, 6).map(cluster => (
          <ClusterCard key={cluster.id} cluster={cluster} />
        ))}
      </div>

      {signals.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-2 text-foreground">Active Signals</h4>
          <div className="space-y-1">
            {signals.slice(0, 3).map(signal => (
              <SignalItem key={signal.clusterId} signal={signal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClusterCard({ cluster }: { cluster: NarrativeCluster }) {
  const isPositive = cluster.growthRate >= 0;
  return (
    <div className="p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 hover:shadow-[0_0_16px_-6px_hsl(var(--primary)/0.15)] transition-all duration-200">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-foreground">{cluster.name}</span>
        <span className={`text-xs font-medium ${isPositive ? 'text-primary' : 'text-destructive'}`}>
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
  const color = signal.signalType === 'HEATING_UP' ? 'text-primary' : 'text-destructive';
  return (
    <div className="flex items-center gap-3 py-2 rounded-lg px-2 hover:bg-secondary/50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-sm text-foreground">{signal.message}</span>
    </div>
  );
}

