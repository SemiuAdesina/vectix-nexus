'use client';

import { useEffect, useState } from 'react';
import { Lock, Shield, ShieldCheck, ShieldAlert, Server, Key, CheckCircle2, XCircle } from 'lucide-react';
import { getTEEStatus, TEEStatus } from '@/lib/api/advanced-features';

export function TEEStatusCard() {
  const [status, setStatus] = useState<TEEStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getTEEStatus();
        setStatus(data);
      } catch {
        setStatus({
          available: false,
          provider: 'unavailable',
          enclaveId: null,
          attestationValid: false,
          keyCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-6 animate-pulse shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <div className="h-6 bg-secondary/80 rounded w-1/3 mb-4" />
        <div className="h-32 bg-secondary/80 rounded-xl" />
      </div>
    );
  }

  const isSecure = status?.available && status.attestationValid;

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)] ${
          isSecure ? 'bg-primary/15 border-primary/30' : 'bg-destructive/10 border-destructive/30'
        }`}>
          {isSecure
            ? <ShieldCheck className="w-5 h-5 text-primary" />
            : <ShieldAlert className="w-5 h-5 text-destructive" />
          }
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Trusted Execution</h3>
          <p className="text-xs text-muted-foreground">
            Hardware-encrypted key storage
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-4 mb-4 ${
        isSecure
          ? 'bg-primary/5 border-primary/30'
          : 'bg-destructive/5 border-destructive/30'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isSecure
            ? <CheckCircle2 className="w-5 h-5 text-primary" />
            : <XCircle className="w-5 h-5 text-destructive" />
          }
          <span className={`font-semibold ${isSecure ? 'text-primary' : 'text-destructive'}`}>
            {isSecure ? 'Enclave Active' : 'Enclave Unavailable'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSecure
            ? 'Your private keys are protected in a hardware-encrypted environment. Even Vectix cannot access them.'
            : 'TEE is not available. Keys are encrypted with software-level security.'
          }
        </p>
      </div>

      <div className="space-y-3">
        <StatusRow
          icon={<Server className="w-4 h-4" />}
          label="Provider"
          value={formatProvider(status?.provider)}
          active={status?.available}
        />
        <StatusRow
          icon={<Shield className="w-4 h-4" />}
          label="Attestation"
          value={status?.attestationValid ? 'Valid' : 'Invalid'}
          active={status?.attestationValid}
        />
        <StatusRow
          icon={<Key className="w-4 h-4" />}
          label="Stored Keys"
          value={`${status?.keyCount ?? 0} keys`}
          active={(status?.keyCount ?? 0) > 0}
        />
        <StatusRow
          icon={<Lock className="w-4 h-4" />}
          label="Enclave ID"
          value={status?.enclaveId ? truncateId(status.enclaveId) : 'N/A'}
          active={!!status?.enclaveId}
        />
      </div>
    </div>
  );
}

interface StatusRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
}

function StatusRow({ icon, label, value, active }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

function formatProvider(provider?: string): string {
  const providerNames: Record<string, string> = {
    'phala': 'Phala Network',
    'intel-sgx': 'Intel SGX',
    'aws-nitro': 'AWS Nitro',
    'simulated': 'Simulated (Dev)',
  };
  return providerNames[provider ?? ''] ?? provider ?? 'Unknown';
}

function truncateId(id: string): string {
  return id.length <= 12 ? id : `${id.slice(0, 6)}...${id.slice(-4)}`;
}
