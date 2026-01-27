'use client';

import { Shield } from 'lucide-react';

interface TrustScoreBadgeProps {
  score: number;
  grade: string;
}

const GRADE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-[hsl(var(--success))]', text: 'text-background', label: 'Excellent' },
  B: { bg: 'bg-primary', text: 'text-background', label: 'Good' },
  C: { bg: 'bg-[hsl(var(--warning))]', text: 'text-background', label: 'Caution' },
  D: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Risky' },
  F: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Dangerous' },
};

export function TrustScoreBadge({ score, grade }: TrustScoreBadgeProps) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.F;

  return (
    <div className={`${config.bg} ${config.text} rounded-xl p-6 text-center`}>
      <Shield className="w-8 h-8 mx-auto mb-2" />
      <p className="text-5xl font-bold mb-1">{score}</p>
      <p className="text-lg font-semibold">Grade {grade}</p>
      <p className="text-sm opacity-80">{config.label}</p>
    </div>
  );
}

