'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface IntegrityCardProps {
  integrityCheck: { valid: boolean; invalidEntries: string[] } | null;
}

export function IntegrityCard({ integrityCheck }: IntegrityCardProps) {
  if (!integrityCheck) return null;

  return (
    <div className={`glass rounded-xl p-6 border-2 ${
      integrityCheck.valid ? 'border-success/50' : 'border-destructive/50'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        {integrityCheck.valid ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive" />
        )}
        <h2 className="text-xl font-semibold">Audit Trail Integrity</h2>
      </div>
      <p className={integrityCheck.valid ? 'text-success' : 'text-destructive'}>
        {integrityCheck.valid
          ? 'All entries verified - trail integrity intact'
          : `Invalid entries detected: ${integrityCheck.invalidEntries.length}`}
      </p>
    </div>
  );
}
