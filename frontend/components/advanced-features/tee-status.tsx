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
      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 animate-pulse">
        <div className="h-5 sm:h-6 bg-slate-700 rounded w-1/3 mb-3 sm:mb-4" />
        <div className="h-24 sm:h-32 bg-slate-700 rounded-lg sm:rounded-xl" />
      </div>
    );
  }

  const isSecure = status?.available && status.attestationValid;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border shrink-0 ${
          isSecure ? 'bg-teal-500/15 border-teal-500/30' : 'bg-red-500/10 border-red-500/30'
        }`}>
          {isSecure ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> : <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-white">Trusted Execution</h3>
          <p className="text-[10px] sm:text-xs text-slate-400">Hardware-encrypted key storage</p>
        </div>
      </div>

      <div className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 mb-3 sm:mb-4 ${
        isSecure ? 'bg-teal-500/5 border-teal-500/30' : 'bg-red-500/5 border-red-500/30'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          {isSecure ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" /> : <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />}
          <span className={`font-semibold text-sm sm:text-base ${isSecure ? 'text-teal-400' : 'text-red-400'}`}>
            {isSecure ? 'Enclave Active' : 'Enclave Unavailable'}
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400">
          {isSecure
            ? 'Your private keys are protected in a hardware-encrypted environment. Even Vectix cannot access them.'
            : 'TEE is not available. Keys are encrypted with software-level security.'}
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <StatusRow icon={<Server className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />} label="Provider" value={formatProvider(status?.provider)} active={status?.available} />
        <StatusRow icon={<Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />} label="Attestation" value={status?.attestationValid ? 'Valid' : 'Invalid'} active={status?.attestationValid} />
        <StatusRow icon={<Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />} label="Stored Keys" value={`${status?.keyCount ?? 0} keys`} active={(status?.keyCount ?? 0) > 0} />
        <StatusRow icon={<Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />} label="Enclave ID" value={status?.enclaveId ? truncateId(status.enclaveId) : 'N/A'} active={!!status?.enclaveId} />
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
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800/30">
      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
        {icon}
        <span className="text-xs sm:text-sm">{label}</span>
      </div>
      <span className={`text-xs sm:text-sm font-medium truncate ml-2 ${active ? 'text-teal-400' : 'text-slate-400'}`}>{value}</span>
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
