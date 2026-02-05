'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getOnChainStatus } from '@/lib/api/onchain';
import type { OnChainStatus } from '@/lib/api/onchain';
import { SecurityAlertsCard } from '@/components/onchain/security-alerts';
import { CircuitBreakerCard } from '@/components/onchain/circuit-breaker-card';
import { MultiSigCard } from '@/components/onchain/multisig-card';
import { TimeLockCard } from '@/components/onchain/timelock-card';
import { StatusCard } from '@/components/onchain/status-card';
import { VerifyProofCard } from '@/components/onchain/verify-proof-card';
import { HowItWorksCard } from '@/components/onchain/how-it-works-card';

export default function OnChainPage() {
  const [status, setStatus] = useState<OnChainStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getOnChainStatus();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch on-chain status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-foreground">On-Chain Verification</h1>
        <p className="text-muted-foreground">
          Verifiable security decisions stored on the Solana blockchain
        </p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <StatusCard status={status} />
      <VerifyProofCard />

      <div className="grid md:grid-cols-2 gap-6">
        <SecurityAlertsCard />
        <CircuitBreakerCard agentId="demo-agent" state={null} onStateChange={() => {}} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <MultiSigCard />
        <TimeLockCard agentId="demo-agent" />
      </div>

      <HowItWorksCard />
    </div>
  );
}
