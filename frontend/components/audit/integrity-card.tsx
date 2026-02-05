'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface IntegrityCardProps {
  integrityCheck: { valid: boolean; invalidEntries: string[] } | null;
}

export function IntegrityCard({ integrityCheck }: IntegrityCardProps) {
  if (!integrityCheck) return null;

  const valid = integrityCheck.valid;
  return (
    <div className={`rounded-2xl border p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)] ${
      valid ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
          valid ? 'bg-primary/15 border-primary/30' : 'bg-destructive/10 border-destructive/30'
        }`}>
          {valid ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-foreground">Audit Trail Integrity</h2>
      </div>
      <p className={valid ? 'text-primary' : 'text-destructive'}>
        {valid
          ? 'All entries verified - trail integrity intact'
          : `Invalid entries detected: ${integrityCheck.invalidEntries.length}`}
      </p>
    </div>
  );
}
