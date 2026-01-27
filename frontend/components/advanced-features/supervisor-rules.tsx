'use client';

import { useEffect, useState } from 'react';
import { Brain, Check, X, Settings2 } from 'lucide-react';
import { getSupervisorRules, updateSupervisorRule, SupervisorRule } from '@/lib/api/advanced-features';

export function SupervisorRulesCard() {
  const [rules, setRules] = useState<SupervisorRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<string | null>(null);

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
    await updateSupervisorRule(ruleId, { enabled });
    setRules(rules.map(r => r.id === ruleId ? { ...r, enabled } : r));
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-secondary rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">Supervisor AI</h3>
          <p className="text-xs text-muted-foreground truncate">
            Constitutional rules the agent cannot break
          </p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {rules.map(rule => (
          <RuleItem
            key={rule.id}
            rule={rule}
            isEditing={editingRule === rule.id}
            onToggle={() => toggleRule(rule.id, !rule.enabled)}
            onEdit={() => setEditingRule(editingRule === rule.id ? null : rule.id)}
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
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

function RuleItem({ rule, onToggle, onEdit }: RuleItemProps) {
  const paramDisplay = Object.entries(rule.params)
    .map(([k, v]) => `${formatParamKey(k)}: ${formatParamValue(v)}`)
    .join(', ');

  return (
    <div className={`rounded-lg border p-3 transition-all ${rule.enabled
      ? 'border-primary/30 bg-primary/5'
      : 'border-border bg-secondary/30'
      }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${rule.enabled
                ? 'bg-primary text-background'
                : 'bg-secondary text-muted-foreground'
                }`}
            >
              {rule.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </button>
            <p className="font-medium text-sm truncate">{rule.description}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-7">
            {paramDisplay}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
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

