'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { analyzeToken, TrustScore, SecurityReport, RiskItem } from '@/lib/api/security';
import { TrustScoreBadge, ChecklistItem } from '@/components/security';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TokenAnalysisPage() {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const result = await analyzeToken(tokenAddress);
      if (result) {
        setTrustScore(result.trustScore);
        setReport(result.report);
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!trustScore || !report) {
    return <AnalysisError tokenAddress={tokenAddress} />;
  }

  const allItems = [...trustScore.passed, ...trustScore.risks]
    .sort((a, b) => (a.passed === b.passed ? 0 : a.passed ? -1 : 1));

  return (
    <div className="w-full">
      <Link href="/dashboard/analysis" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Analysis
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Token Security Analysis</h1>
        <p className="text-muted-foreground font-mono text-sm">{tokenAddress}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <TrustScoreBadge score={trustScore.score} grade={trustScore.grade} />
        <RiskSummary risks={trustScore.risks} passed={trustScore.passed} />
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="font-semibold mb-4">Security Checklist</h2>
        <div className="space-y-3">
          {allItems.map(item => <ChecklistItem key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function RiskSummary({ risks, passed }: { risks: RiskItem[]; passed: RiskItem[] }) {
  const critical = risks.filter(r => r.severity === 'critical').length;
  const high = risks.filter(r => r.severity === 'high').length;

  return (
    <div className="lg:col-span-2 glass rounded-xl p-6">
      <h3 className="font-semibold mb-4">Risk Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        <SummaryBox value={passed.length} label="Passed" color="success" />
        <SummaryBox value={critical} label="Critical" color="destructive" />
        <SummaryBox value={high} label="High Risk" color="warning" />
      </div>
    </div>
  );
}

function SummaryBox({ value, label, color }: { value: number; label: string; color: string }) {
  const colorMap = {
    success: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  };
  return (
    <div className={`text-center p-4 rounded-lg ${colorMap[color as keyof typeof colorMap]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function AnalysisError({ tokenAddress }: { tokenAddress: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--warning))]" />
      <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
      <p className="text-muted-foreground mb-6">Could not analyze: {tokenAddress.slice(0, 12)}...</p>
      <Link href="/dashboard/analysis"><Button>Back to Analysis</Button></Link>
    </div>
  );
}
