'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAgentBalance, withdrawAgentFunds, WalletBalance, WithdrawResult } from '@/lib/api/client';
import { Wallet, ExternalLink, Loader2, Check, AlertCircle, ArrowDownToLine } from 'lucide-react';

interface AgentWalletProps {
  agentId: string;
  walletAddress?: string;
}

export function AgentWallet({ agentId, walletAddress }: AgentWalletProps) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [result, setResult] = useState<WithdrawResult | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try { setBalance(await getAgentBalance(agentId)); }
      catch { setBalance(null); }
      finally { setLoading(false); }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [agentId]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setResult(null);
    try {
      const res = await withdrawAgentFunds(agentId, useCustom && customAddress ? customAddress : undefined);
      setResult(res);
      if (res.success) setBalance(await getAgentBalance(agentId));
    } catch (e) {
      setResult({ success: false, error: e instanceof Error ? e.message : 'Withdrawal failed' });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-muted-foreground flex items-center gap-2"><Wallet className="w-4 h-4" /> Agent Wallet</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-success font-medium">Solana</span>
          </div>
        </div>

        {walletAddress && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <p className="font-mono text-sm bg-secondary px-3 py-2 rounded-lg break-all">{walletAddress}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">Balance</p>
          {loading ? (
            <div className="h-12 bg-secondary rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{balance?.sol.toFixed(4) || '0.0000'}</span>
              <span className="text-muted-foreground">SOL</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-secondary accent-primary" />
            <span className="text-sm text-muted-foreground">Withdraw to custom address</span>
          </label>
          {useCustom && (
            <Input placeholder="Enter Solana address" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)}
              className="font-mono text-sm bg-secondary border-border" />
          )}
        </div>
      </div>

      <Button size="lg" onClick={handleWithdraw} disabled={withdrawing || !balance || balance.sol < 0.001} className="w-full">
        {withdrawing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><ArrowDownToLine className="w-4 h-4" /> Withdraw All Funds</>}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg text-sm ${result.success ? 'bg-success/10 border border-success/20 text-success' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {result.success ? (
            <>
              <p className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> Withdrawn {result.amountSol?.toFixed(4)} SOL</p>
              {result.signature && (
                <a href={`https://solscan.io/tx/${result.signature}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary mt-1 hover:underline">
                  View on Solscan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </>
          ) : (
            <p className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
