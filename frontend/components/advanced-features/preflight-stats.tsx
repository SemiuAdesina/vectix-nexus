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
      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 animate-pulse">
        <div className="h-5 sm:h-6 bg-slate-700 rounded w-1/3 mb-3 sm:mb-4" />
        <div className="h-16 sm:h-20 bg-slate-700 rounded-lg sm:rounded-xl" />
      </div>
    );
  }

  const approvalRate = stats && stats.total > 0
    ? Math.round((stats.approved / stats.total) * 100)
    : 100;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-white">Pre-Flight Protection</h3>
          <p className="text-[10px] sm:text-xs text-slate-400">Simulates transactions before execution</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatBox icon={<ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />} label="Approved" value={stats?.approved ?? 0} />
        <StatBox icon={<ShieldX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />} label="Blocked" value={stats?.blocked ?? 0} />
        <StatBox icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />} label="Total" value={stats?.total ?? 0} />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-slate-400">Approval Rate</span>
          <span className="font-medium text-white">{approvalRate}%</span>
        </div>
        <div className="h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${approvalRate}%` }} />
        </div>
      </div>

      {stats?.blockedReasons && stats.blockedReasons.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1.5 sm:mb-2">Recent Blocks</p>
          <div className="space-y-1">
            {stats.blockedReasons.slice(0, 3).map((reason, i) => (
              <p key={i} className="text-[10px] sm:text-xs text-red-400 truncate">{reason}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800/50 p-2 sm:p-3 text-center">
      <div className="flex justify-center mb-0.5 sm:mb-1">{icon}</div>
      <p className="text-base sm:text-lg font-semibold text-white">{value}</p>
      <p className="text-[10px] sm:text-xs text-slate-400">{label}</p>
    </div>
  );
}
