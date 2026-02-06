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
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!available) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <Layers className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="font-semibold text-white">Narrative Tracking</h3>
          <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-lg">Coming Soon</span>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-400">
            Requires LunarCrush API key. Add <code className="text-xs bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">LUNARCRUSH_API_KEY</code> to enable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <Layers className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="font-semibold text-white">Narrative Clusters</h3>
        </div>
        <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-lg font-medium">Live</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {clusters.slice(0, 6).map(cluster => (
          <ClusterCard key={cluster.id} cluster={cluster} />
        ))}
      </div>

      {signals.length > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <h4 className="text-sm font-medium mb-2 text-white">Active Signals</h4>
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
    <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-teal-500/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-white">{cluster.name}</span>
        <span className={`text-xs font-medium ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{cluster.growthRate.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>{cluster.mentionCount.toLocaleString()} mentions</span>
        <span className="w-1 h-1 rounded-full bg-slate-500" />
        <span>Heat: {cluster.heatScore}</span>
      </div>
    </div>
  );
}

function SignalItem({ signal }: { signal: NarrativeSignal }) {
  const Icon = signal.signalType === 'HEATING_UP' ? TrendingUp : TrendingDown;
  const color = signal.signalType === 'HEATING_UP' ? 'text-teal-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-3 py-2 rounded-lg px-2 hover:bg-slate-800/50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-sm text-white">{signal.message}</span>
    </div>
  );
}
