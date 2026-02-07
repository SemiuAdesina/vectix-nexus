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
      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 animate-pulse">
        <div className="h-5 sm:h-6 bg-slate-700 rounded w-1/3 mb-3 sm:mb-4" />
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 sm:h-16 bg-slate-700 rounded-lg sm:rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-white">Supervisor AI</h3>
          <p className="text-[10px] sm:text-xs text-slate-400">Constitutional rules the agent cannot break</p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 min-w-0">
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

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-400">Active Rules</span>
          <span className="font-medium text-teal-400">
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
      className={`rounded-lg sm:rounded-xl border p-2.5 sm:p-3 transition-all cursor-pointer select-none ${
        rule.enabled
          ? 'border-teal-500/30 bg-teal-500/5 hover:border-teal-500/40'
          : 'border-slate-700 bg-slate-800/30 hover:border-teal-500/20'
      } ${toggling ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center transition-colors shrink-0 ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-slate-950 ${
                rule.enabled ? 'bg-teal-500 text-white ring-teal-500/30' : 'bg-slate-700 text-slate-400 ring-slate-600'
              }`}
              aria-hidden
            >
              {rule.enabled ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </div>
            <p className="font-medium text-xs sm:text-sm truncate text-white">{rule.description}</p>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 ml-7 sm:ml-9 truncate">{paramDisplay}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 transition-colors shrink-0"
          aria-label="Edit rule"
        >
          <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
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
