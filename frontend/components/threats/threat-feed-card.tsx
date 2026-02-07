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
    <div className="space-y-2 sm:space-y-3 max-h-[600px] overflow-y-auto">
      {threats.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-slate-400">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-teal-500/30">
            <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-teal-400 opacity-70" />
          </div>
          <p className="text-xs sm:text-sm font-medium mb-1 text-white">No threats detected</p>
          <p className="text-[10px] sm:text-xs">Threats will appear here as they are detected or reported by Vectix Foundry</p>
        </div>
      ) : (
        threats.map((threat) => {
          const Icon = typeIcons[threat.type] || AlertTriangle;
          return (
            <div key={threat.id} className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 border ${severityColors[threat.severity]}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">{threat.description}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border ${severityColors[threat.severity]}`}>
                      {threat.severity}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400">
                      {threat.confidence}%
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">•</span>
                    <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
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
