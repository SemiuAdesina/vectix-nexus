'use client';

import { Check, X, AlertTriangle } from 'lucide-react';
import type { RiskItem } from '@/lib/api/security';

interface ChecklistItemProps {
  item: RiskItem;
}

const SEVERITY_COLORS = {
  critical: 'border-destructive/30 bg-destructive/5',
  high: 'border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5',
  medium: 'border-border bg-secondary/30',
  low: 'border-border bg-secondary/30',
};

export function ChecklistItem({ item }: ChecklistItemProps) {
  const borderClass = item.passed 
    ? 'border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5' 
    : SEVERITY_COLORS[item.severity];

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border ${borderClass}`}>
      {item.passed ? (
        <Check className="w-5 h-5 text-[hsl(var(--success))]" />
      ) : item.severity === 'critical' ? (
        <X className="w-5 h-5 text-destructive" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />
      )}
      <div className="flex-1">
        <p className="font-medium">{item.label}</p>
        <p className="text-sm text-muted-foreground">{item.message}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded font-medium ${
        item.passed 
          ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' 
          : 'bg-destructive/20 text-destructive'
      }`}>
        {item.passed ? 'PASS' : 'FAIL'}
      </span>
    </div>
  );
}

