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
    low: 'text-sky-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };

  const typeIcons = {
    score_change: TrendingDown,
    new_risk: AlertTriangle,
    blacklist_update: Shield,
    anomaly_detected: Activity,
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <AlertTriangle className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="font-semibold text-white">Security Alerts</h3>
        <span className="text-sm text-slate-400">({alerts.length})</span>
      </div>

      <div className="space-y-2">
        {alerts.slice(0, 5).map((alert) => {
          const Icon = typeIcons[alert.type] || AlertTriangle;
          return (
            <div key={alert.id} className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20">
                  <Icon className={`w-4 h-4 ${severityColors[alert.severity]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
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
