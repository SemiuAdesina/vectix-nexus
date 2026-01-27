'use client';

import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Detection Stats</CardTitle>
        </div>
        <CardDescription>Threat intelligence metrics by severity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
                  {stat.value}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
