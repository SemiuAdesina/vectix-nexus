'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAgentBalance, WalletBalance } from '@/lib/api/client';
import { WithdrawalConfirmModal } from '@/components/wallet/withdrawal-confirm-modal';
import { Wallet, ArrowDownToLine } from 'lucide-react';

interface AgentWalletProps {
  agentId: string;
  walletAddress?: string;
  userPayoutWallet?: string;
}

export function AgentWallet({ agentId, walletAddress, userPayoutWallet }: AgentWalletProps) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [customAddress, setCustomAddress] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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

  const handleWithdrawClick = () => setShowWithdrawModal(true);
  const handleWithdrawSuccess = async () => {
    setShowWithdrawModal(false);
    setBalance(await getAgentBalance(agentId));
  };

  const destinationAddress = useCustom ? customAddress : (userPayoutWallet || '');

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
            <span className="text-sm text-muted-foreground">
              Withdraw to custom address
              {!useCustom && userPayoutWallet && <span className="text-xs text-primary ml-2">(Defaulting to: {userPayoutWallet.slice(0, 4)}...{userPayoutWallet.slice(-4)})</span>}
            </span>
          </label>
          {useCustom && (
            <Input placeholder="Enter Solana address" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)}
              className="font-mono text-sm bg-secondary border-border" />
          )}
        </div>
      </div>

      <Button size="lg" onClick={handleWithdrawClick} disabled={!balance || balance.sol < 0.001 || !destinationAddress} className="w-full">
        <ArrowDownToLine className="w-4 h-4" /> Withdraw All Funds
      </Button>

      {showWithdrawModal && destinationAddress && (
        <WithdrawalConfirmModal
          agentId={agentId}
          destinationAddress={destinationAddress}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
}
