'use client';

import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';

interface DetectionStatsCardProps {
  threats: ThreatIntelligence[];
}

export function DetectionStatsCard({ threats }: DetectionStatsCardProps) {
  const total = threats.length;
  const critical = threats.filter(t => t.severity === 'critical').length;
  const high = threats.filter(t => t.severity === 'high').length;
  const medium = threats.filter(t => t.severity === 'medium').length;
  const low = threats.filter(t => t.severity === 'low').length;

  const stats = [
    { label: 'Total Threats', value: total, icon: Shield, color: 'text-teal-400', box: 'bg-teal-500/15 border-teal-500/30' },
    { label: 'Critical', value: critical, icon: AlertTriangle, color: 'text-red-400', box: 'bg-red-500/10 border-red-500/30' },
    { label: 'High', value: high, icon: AlertTriangle, color: 'text-orange-400', box: 'bg-orange-500/10 border-orange-500/30' },
    { label: 'Medium', value: medium, icon: TrendingUp, color: 'text-amber-400', box: 'bg-amber-500/10 border-amber-500/30' },
    { label: 'Low', value: low, icon: Activity, color: 'text-sky-400', box: 'bg-sky-500/10 border-sky-500/30' },
  ];

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg font-semibold text-white">Detection Stats</h2>
          <p className="text-[10px] sm:text-sm text-slate-400">Threat intelligence metrics by severity</p>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 border ${stat.box}`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.color}`} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-white">{stat.label}</span>
              </div>
              <span className="text-sm sm:text-base font-semibold text-white tabular-nums">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
