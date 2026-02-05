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
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Affiliate Program</h1>
        <p className="text-muted-foreground">Earn 20% commission on referral trading fees</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Users />} label="Total Referrals" value={stats?.totalReferrals?.toString() || '0'} />
        <StatCard icon={<DollarSign />} label="Total Earnings" value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`} />
        <StatCard icon={<TrendingUp />} label="Pending Payout" value={`$${stats?.pendingPayouts?.toFixed(2) || '0.00'}`} color="primary" />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 mb-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
        <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
            <Copy className="w-4 h-4 text-primary" />
          </div>
          Your Referral Link
        </h3>
        {stats?.referralCode ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              value={`https://vectix.io/ref/${stats.referralCode}`}
              className="flex-1 h-11 px-4 rounded-lg bg-secondary/80 border border-border text-sm font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'outline' : 'default'}
              className={`shrink-0 ${copied ? 'border-primary/30 text-primary' : 'shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]'}`}
            >
              {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGenerateCode}
            disabled={generating}
            className="w-full shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
            {generating ? 'Generating...' : 'Generate Your Referral Link'}
          </Button>
        )}
        <p className="text-sm text-muted-foreground mt-3">
          Share this link and earn 20% of trading fees from every user who signs up.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <h3 className="font-semibold mb-4 text-foreground">How it works</h3>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Send your unique referral link to friends' },
            { step: '2', title: 'They trade', desc: 'When they make trades using their agents' },
            { step: '3', title: 'You earn forever', desc: 'Get 20% of their trading fees, perpetually' },
          ].map(item => (
            <div key={item.step} className="flex gap-4 items-start p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.2)]">
                <span className="text-sm font-bold text-primary">{item.step}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
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
  const valueColor = color === 'primary' ? 'text-primary' : 'text-foreground';
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)] hover:border-primary/40 hover:shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)] transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-3 border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)]">
        {icon}
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
