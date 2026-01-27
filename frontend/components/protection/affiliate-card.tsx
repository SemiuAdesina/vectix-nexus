'use client';

import { useState, useEffect } from 'react';
import { Users, Copy, Check, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAffiliateStats, generateReferralCode, AffiliateStats } from '@/lib/api/protection';

interface AffiliateCardProps {
  userId: string;
}

export function AffiliateCard({ userId }: AffiliateCardProps) {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getAffiliateStats(userId);
      setStats(data);
    };
    fetchStats();
  }, [userId]);

  const handleGenerateCode = async () => {
    setLoading(true);
    const code = await generateReferralCode(userId);
    if (code) {
      setStats(prev => prev ? { ...prev, referralCode: code } : null);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!stats?.referralCode) return;
    const link = `https://vectix.io/ref/${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Affiliate Program</h3>
          <p className="text-xs text-muted-foreground">Earn 20% of referral trading fees</p>
        </div>
      </div>

      {!stats?.referralCode ? (
        <Button onClick={handleGenerateCode} disabled={loading} className="w-full mb-4">
          {loading ? 'Generating...' : 'Generate Referral Link'}
        </Button>
      ) : (
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">Your Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-secondary font-mono text-sm truncate">
              vectix.io/ref/{stats.referralCode}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-[hsl(var(--success))]" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg bg-secondary text-center">
          <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
          <p className="text-xs text-muted-foreground">Referrals</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary text-center">
          <DollarSign className="w-5 h-5 mx-auto mb-2 text-[hsl(var(--success))]" />
          <p className="text-2xl font-bold">${stats?.totalEarnings?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </div>
      </div>

      {(stats?.pendingPayouts || 0) > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--success))]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--success))]" />
            <span className="text-sm">Pending Payout</span>
          </div>
          <span className="font-semibold text-[hsl(var(--success))]">${stats?.pendingPayouts?.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

