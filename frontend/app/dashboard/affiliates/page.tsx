'use client';

import { useState, useEffect } from 'react';
import { Users, Copy, DollarSign, TrendingUp, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAffiliateStats, generateReferralCode, AffiliateStats } from '@/lib/api/protection';
import { useUser } from '@clerk/nextjs';

export default function AffiliatesPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const userId = user?.id || 'demo-user';

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getAffiliateStats(userId);
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [userId]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    const code = await generateReferralCode(userId);
    if (code) {
      setStats(prev => prev ? { ...prev, referralCode: code } : { referralCode: code, totalReferrals: 0, totalEarnings: 0, pendingPayouts: 0 });
    }
    setGenerating(false);
  };

  const copyToClipboard = () => {
    if (!stats?.referralCode) return;
    navigator.clipboard.writeText(`https://vectix.io/ref/${stats.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Affiliate Program</h1>
        <p className="text-sm sm:text-base text-slate-400">Earn 20% commission on referral trading fees</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatCard icon={<Users />} label="Total Referrals" value={stats?.totalReferrals?.toString() || '0'} />
        <StatCard icon={<DollarSign />} label="Total Earnings" value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`} />
        <StatCard icon={<TrendingUp />} label="Pending Payout" value={`$${stats?.pendingPayouts?.toFixed(2) || '0.00'}`} accent />
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-white flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
          </div>
          Your Referral Link
        </h3>
        {stats?.referralCode ? (
          <div className="flex flex-row gap-2 sm:gap-3">
            <input
              type="text"
              readOnly
              value={`https://vectix.io/ref/${stats.referralCode}`}
              className="flex-1 min-w-0 h-10 sm:h-11 px-3 sm:px-4 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] sm:text-sm font-mono text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'outline' : 'default'}
              className={`shrink-0 h-10 sm:h-11 text-xs sm:text-sm px-3 sm:px-4 ${copied ? 'border-teal-500/30 text-teal-400' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20'}`}
            >
              {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGenerateCode}
            disabled={generating}
            className="w-full text-sm sm:text-base bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
            {generating ? 'Generating...' : 'Generate Your Referral Link'}
          </Button>
        )}
        <p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-3">
          Share this link and earn 20% of trading fees from every user who signs up.
        </p>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-white">How it works</h3>
        <div className="space-y-2 sm:space-y-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Send your unique referral link to friends' },
            { step: '2', title: 'They trade', desc: 'When they make trades using their agents' },
            { step: '3', title: 'You earn forever', desc: 'Get 20% of their trading fees, perpetually' },
          ].map(item => (
            <div key={item.step} className="flex gap-2.5 sm:gap-4 items-start p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-teal-500/5 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0 border border-teal-500/30">
                <span className="text-xs sm:text-sm font-bold text-teal-400">{item.step}</span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-white">{item.title}</p>
                <p className="text-xs sm:text-sm text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-3 sm:p-5 hover:border-teal-500/30 hover:shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)] transition-all duration-200">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 mb-2 sm:mb-3 border border-teal-500/30 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
        {icon}
      </div>
      <p className={`text-lg sm:text-2xl font-bold ${accent ? 'text-teal-400' : 'text-white'}`}>{value}</p>
      <p className="text-[10px] sm:text-sm text-slate-400">{label}</p>
    </div>
  );
}
