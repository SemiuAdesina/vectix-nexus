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
    { label: 'Total Threats', value: total, icon: Shield, color: 'text-primary' },
    { label: 'Critical', value: critical, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'High', value: high, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Medium', value: medium, icon: TrendingUp, color: 'text-yellow-500' },
    { label: 'Low', value: low, icon: Activity, color: 'text-blue-500' },
  ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Detection Stats</h2>
          <p className="text-sm text-muted-foreground">Threat intelligence metrics by severity</p>
        </div>
      </div>
      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  stat.color === 'text-primary' ? 'bg-primary/15 border-primary/20' :
                  stat.color === 'text-destructive' ? 'bg-destructive/10 border-destructive/20' :
                  'bg-secondary/50 border-border'
                }`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{stat.label}</span>
              </div>
              <span className="text-base font-semibold text-foreground tabular-nums">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
