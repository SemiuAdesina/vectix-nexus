'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface IntegrityCardProps {
  integrityCheck: { valid: boolean; invalidEntries: string[] } | null;
}

export function IntegrityCard({ integrityCheck }: IntegrityCardProps) {
  if (!integrityCheck) return null;

  const valid = integrityCheck.valid;
  return (
    <div className={`rounded-2xl border p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)] ${
      valid ? 'border-teal-500/30 bg-teal-500/5' : 'border-red-500/30 bg-red-500/5'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
          valid ? 'bg-teal-500/15 border-teal-500/30' : 'bg-red-500/10 border-red-500/30'
        }`}>
          {valid ? (
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-white">Audit Trail Integrity</h2>
      </div>
      <p className={valid ? 'text-teal-400' : 'text-red-400'}>
        {valid
          ? 'All entries verified - trail integrity intact'
          : `Invalid entries detected: ${integrityCheck.invalidEntries.length}`}
      </p>
    </div>
  );
}
