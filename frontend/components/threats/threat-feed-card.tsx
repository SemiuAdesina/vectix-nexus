'use client';

import React from 'react';
import { AlertTriangle, Activity, TrendingDown, Shield } from 'lucide-react';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';
import { Badge } from '@/components/ui/badge';

interface ThreatFeedCardProps {
  threats: ThreatIntelligence[];
}

export function ThreatFeedCard({ threats }: ThreatFeedCardProps) {
  const severityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const typeIcons = {
    anomaly: Activity,
    pattern_match: TrendingDown,
    community_report: Shield,
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {threats.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <AlertTriangle className="w-7 h-7 text-primary opacity-70" />
          </div>
          <p className="text-sm font-medium mb-1 text-foreground">No threats detected</p>
          <p className="text-xs">Threats will appear here as they are detected or reported by VectixLogic</p>
        </div>
      ) : (
        threats.map((threat) => {
          const Icon = typeIcons[threat.type] || AlertTriangle;
          return (
            <div key={threat.id} className="p-4 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${severityColors[threat.severity]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-2 text-foreground">{threat.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${severityColors[threat.severity]}`}>
                      {threat.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {threat.confidence}%
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
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
