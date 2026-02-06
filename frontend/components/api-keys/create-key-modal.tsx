'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ApiConfig, ApiScope } from '@/lib/api/api-keys';

interface CreateKeyModalProps {
  config: ApiConfig;
  onClose: () => void;
  onCreate: (name: string, scopes: ApiScope[]) => Promise<void>;
}

export function CreateKeyModal({ config, onClose, onCreate }: CreateKeyModalProps) {
  const [name, setName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>(['read:agents']);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleScope(scope: ApiScope) {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || selectedScopes.length === 0) return;
    setError(null);
    setCreating(true);
    try {
      await onCreate(name, selectedScopes);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create API key';
      setError(msg === 'Unauthorized' ? 'Please sign in to create API keys.' : msg);
    } finally {
      setCreating(false);
    }
  }

  const allScopes = Object.keys(config.scopes) as ApiScope[];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 w-full max-w-md p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create API Key</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-teal-500/10 hover:text-teal-400 rounded-lg transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block text-white">Key Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production Key"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-white">Permissions</label>
            <div className="space-y-2">
              {allScopes.map(scope => {
                const isPro = !config.tiers.free.includes(scope);
                const selected = selectedScopes.includes(scope);
                return (
                  <label
                    key={scope}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selected
                        ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_12px_-4px_rgba(20,184,166,0.2)]'
                        : 'border-slate-700 bg-slate-800/50 hover:border-teal-500/40'
                    } ${isPro ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleScope(scope)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      selected ? 'bg-teal-500 border-teal-500' : 'border-slate-500'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{scope}</p>
                      <p className="text-xs text-slate-400 truncate">{config.scopes[scope]}</p>
                    </div>
                    {isPro && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                        PRO
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={creating || !name.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
          >
            {creating ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
