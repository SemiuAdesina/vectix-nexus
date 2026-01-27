'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhitelistStatus, setWhitelistedWallet, WhitelistStatus } from '@/lib/api/protection';

interface WhitelistCardProps {
  agentId: string;
}

export function WhitelistCard({ agentId }: WhitelistCardProps) {
  const [status, setStatus] = useState<WhitelistStatus | null>(null);
  const [newWallet, setNewWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await getWhitelistStatus(agentId);
      setStatus(data);
    };
    fetchStatus();
  }, [agentId]);

  const handleSetWallet = async () => {
    if (!newWallet.trim()) return;
    setLoading(true);
    setMessage('');

    const result = await setWhitelistedWallet(agentId, newWallet);

    if (result.success) {
      setMessage(result.message || 'Wallet updated');
      const updated = await getWhitelistStatus(agentId);
      setStatus(updated);
      setNewWallet('');
    } else {
      setMessage('Failed to update wallet');
    }

    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Withdrawal Whitelist</h3>
          <p className="text-xs text-muted-foreground">24h timelock on wallet changes</p>
        </div>
      </div>

      {status?.isLocked && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--warning))]/10 mb-4">
          <Lock className="w-4 h-4 text-[hsl(var(--warning))]" />
          <span className="text-sm">Locked until {new Date(status.lockedUntil!).toLocaleString()}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Current Whitelisted Wallet</label>
          <div className="p-3 rounded-lg bg-secondary font-mono text-sm truncate">
            {status?.whitelistedWallet || 'Not set'}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">New Wallet Address</label>
          <input
            type="text"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            placeholder="Enter Solana wallet address"
            className="w-full p-3 rounded-lg bg-secondary border border-border text-sm"
            disabled={status?.isLocked}
          />
        </div>

        {message && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Clock className="w-4 h-4" />
            {message}
          </div>
        )}

        <Button
          onClick={handleSetWallet}
          disabled={loading || status?.isLocked || !newWallet.trim()}
          className="w-full"
        >
          {loading ? 'Updating...' : 'Set Whitelist Address'}
        </Button>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Changing wallet triggers 24h withdrawal lock
        </p>
      </div>
    </div>
  );
}

