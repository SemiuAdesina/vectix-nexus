'use client';

import React from 'react';
import { AlertTriangle, Activity, TrendingDown, Shield } from 'lucide-react';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';

interface ThreatFeedCardProps {
  threats: ThreatIntelligence[];
}

export function ThreatFeedCard({ threats }: ThreatFeedCardProps) {
  const severityColors = {
    low: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const typeIcons = {
    anomaly: Activity,
    pattern_match: TrendingDown,
    community_report: Shield,
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {threats.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
            <AlertTriangle className="w-7 h-7 text-teal-400 opacity-70" />
          </div>
          <p className="text-sm font-medium mb-1 text-white">No threats detected</p>
          <p className="text-xs">Threats will appear here as they are detected or reported by Vectix Foundry</p>
        </div>
      ) : (
        threats.map((threat) => {
          const Icon = typeIcons[threat.type] || AlertTriangle;
          return (
            <div key={threat.id} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${severityColors[threat.severity]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-2 text-white">{threat.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-lg border ${severityColors[threat.severity]}`}>
                      {threat.severity}
                    </span>
                    <span className="text-xs text-slate-400">
                      Confidence: {threat.confidence}%
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">
                      {threat.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
