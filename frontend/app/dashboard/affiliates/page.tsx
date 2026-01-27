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
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Affiliate Program</h1>
        <p className="text-sm text-muted-foreground">Earn 20% commission on referral trading fees</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard icon={<Users />} label="Total Referrals" value={stats?.totalReferrals?.toString() || '0'} />
        <StatCard icon={<DollarSign />} label="Total Earnings" value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`} />
        <StatCard icon={<TrendingUp />} label="Pending Payout" value={`$${stats?.pendingPayouts?.toFixed(2) || '0.00'}`} color="success" />
      </div>

      <div className="glass rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">Your Referral Link</h3>
        {stats?.referralCode ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              value={`https://vectix.io/ref/${stats.referralCode}`}
              className="flex-1 h-11 px-4 rounded-lg bg-secondary border border-border text-xs sm:text-sm font-mono"
            />
            <Button onClick={copyToClipboard} variant={copied ? 'outline' : 'default'} className="w-full sm:w-auto">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerateCode} disabled={generating} className="w-full">
            {generating ? 'Generating...' : 'Generate Your Referral Link'}
          </Button>
        )}
        <p className="text-sm text-muted-foreground mt-3">
          Share this link and earn 20% of trading fees from every user who signs up.
        </p>
      </div>

      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">How it works</h3>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Send your unique referral link to friends' },
            { step: '2', title: 'They trade', desc: 'When they make trades using their agents' },
            { step: '3', title: 'You earn forever', desc: 'Get 20% of their trading fees, perpetually' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{item.step}</span>
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  const textColor = color === 'success' ? 'text-[hsl(var(--success))]' : 'text-foreground';
  return (
    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2 sm:mb-3">
        {icon}
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
