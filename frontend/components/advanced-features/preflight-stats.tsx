'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { getPreflightStats, PreflightStats } from '@/lib/api/advanced-features';

interface PreflightStatsCardProps {
  agentId: string;
}

export function PreflightStatsCard({ agentId }: PreflightStatsCardProps) {
  const [stats, setStats] = useState<PreflightStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPreflightStats(agentId);
        setStats(data);
      } catch {
        setStats({ total: 0, approved: 0, blocked: 0, blockedReasons: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [agentId]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
        <div className="h-20 bg-secondary rounded" />
      </div>
    );
  }

  const approvalRate = stats && stats.total > 0 
    ? Math.round((stats.approved / stats.total) * 100) 
    : 100;

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Pre-Flight Protection</h3>
          <p className="text-xs text-muted-foreground">
            Simulates transactions before execution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox
          icon={<ShieldCheck className="w-4 h-4 text-[hsl(var(--success))]" />}
          label="Approved"
          value={stats?.approved ?? 0}
        />
        <StatBox
          icon={<ShieldX className="w-4 h-4 text-destructive" />}
          label="Blocked"
          value={stats?.blocked ?? 0}
        />
        <StatBox
          icon={<AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />}
          label="Total"
          value={stats?.total ?? 0}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Approval Rate</span>
          <span className="font-medium">{approvalRate}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${approvalRate}%` }}
          />
        </div>
      </div>

      {stats?.blockedReasons && stats.blockedReasons.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Recent Blocks</p>
          <div className="space-y-1">
            {stats.blockedReasons.slice(0, 3).map((reason, i) => (
              <p key={i} className="text-xs text-destructive truncate">
                {reason}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

