'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Shield, Activity } from 'lucide-react';
import { getSecurityAlerts } from '@/lib/api/onchain';
import type { SecurityAlert } from '@/lib/api/onchain/types';

export function SecurityAlertsCard() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await getSecurityAlerts({ limit: 10 });
      if (data.success) {
        setAlerts(data.alerts.map(a => ({ ...a, timestamp: new Date(a.timestamp) })));
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    low: 'text-blue-500',
    medium: 'text-warning',
    high: 'text-orange-500',
    critical: 'text-destructive',
  };

  const typeIcons = {
    score_change: TrendingDown,
    new_risk: AlertTriangle,
    blacklist_update: Shield,
    anomaly_detected: Activity,
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
          <AlertTriangle className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Security Alerts</h3>
        <span className="text-sm text-muted-foreground">({alerts.length})</span>
      </div>

      <div className="space-y-2">
        {alerts.slice(0, 5).map((alert) => {
          const Icon = typeIcons[alert.type] || AlertTriangle;
          return (
            <div key={alert.id} className="p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Icon className={`w-4 h-4 ${severityColors[alert.severity]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{alert.severity}</span>
                    <span>•</span>
                    <span>{alert.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
