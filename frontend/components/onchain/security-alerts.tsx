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
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Security Alerts</h3>
        <span className="text-sm text-muted-foreground">({alerts.length})</span>
      </div>

      <div className="space-y-2">
        {alerts.slice(0, 5).map((alert) => {
          const Icon = typeIcons[alert.type] || AlertTriangle;
          return (
            <div key={alert.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 mt-0.5 ${severityColors[alert.severity]}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
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
