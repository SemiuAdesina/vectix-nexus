'use client';

import { useEffect, useState } from 'react';
import { Brain, Check, X, Settings2 } from 'lucide-react';
import { getSupervisorRules, updateSupervisorRule, SupervisorRule } from '@/lib/api/advanced-features';

export function SupervisorRulesCard() {
  const [rules, setRules] = useState<SupervisorRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await getSupervisorRules();
        setRules(data);
      } catch {
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    setTogglingId(ruleId);
    const previous = rules.find(r => r.id === ruleId);
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r));
    try {
      await updateSupervisorRule(ruleId, { enabled });
    } catch {
      if (previous != null) {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: previous.enabled } : r));
      }
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-6 animate-pulse shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <div className="h-6 bg-secondary/80 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-secondary/80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)]">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Supervisor AI</h3>
          <p className="text-xs text-muted-foreground">
            Constitutional rules the agent cannot break
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rules.map(rule => (
          <RuleItem
            key={rule.id}
            rule={rule}
            toggling={togglingId === rule.id}
            onToggle={() => toggleRule(rule.id, !rule.enabled)}
            onEdit={(e) => { e.stopPropagation(); setEditingRule(editingRule === rule.id ? null : rule.id); }}
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Active Rules</span>
          <span className="font-medium text-primary">
            {rules.filter(r => r.enabled).length}/{rules.length}
          </span>
        </div>
      </div>
    </div>
  );
}

interface RuleItemProps {
  rule: SupervisorRule;
  toggling: boolean;
  onToggle: () => void;
  onEdit: (e: React.MouseEvent) => void;
}

function RuleItem({ rule, toggling, onToggle, onEdit }: RuleItemProps) {
  const paramDisplay = Object.entries(rule.params)
    .map(([k, v]) => `${formatParamKey(k)}: ${formatParamValue(v)}`)
    .join(', ');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={rule.enabled}
      aria-label={rule.enabled ? `Disable rule: ${rule.description}` : `Enable rule: ${rule.description}`}
      onClick={toggling ? undefined : onToggle}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !toggling) { e.preventDefault(); onToggle(); } }}
      className={`rounded-xl border p-3 transition-all cursor-pointer select-none ${
        rule.enabled
          ? 'border-primary/30 bg-primary/5 hover:border-primary/40'
          : 'border-border bg-secondary/30 hover:border-primary/20'
      } ${toggling ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ring-2 ring-offset-2 ring-offset-background ${
                rule.enabled
                  ? 'bg-primary text-primary-foreground ring-primary/30'
                  : 'bg-secondary text-muted-foreground ring-border'
              }`}
              aria-hidden
            >
              {rule.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            </div>
            <p className="font-medium text-sm truncate text-foreground">{rule.description}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-9">
            {paramDisplay}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
          aria-label="Edit rule"
        >
          <Settings2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function formatParamKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function formatParamValue(value: number | string | string[]): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') {
    return value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `${value}%`;
  }
  return String(value);
}

