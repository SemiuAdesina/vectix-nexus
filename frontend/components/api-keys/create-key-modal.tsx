'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="rounded-2xl border border-primary/20 bg-card w-full max-w-md p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Create API Key</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">Key Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production Key"
              className="w-full px-3 py-2 rounded-xl bg-background/80 border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">Permissions</label>
            <div className="space-y-2">
              {allScopes.map(scope => {
                const isPro = !config.tiers.free.includes(scope);
                return (
                  <label 
                    key={scope} 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedScopes.includes(scope) ? 'border-primary bg-primary/10 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]' : 'border-primary/20 bg-background/50 hover:border-primary/40'
                    } ${isPro ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedScopes.includes(scope) ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {selectedScopes.includes(scope) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{scope}</p>
                      <p className="text-xs text-muted-foreground">{config.scopes[scope]}</p>
                    </div>
                    {isPro && <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1 border-primary/30 hover:bg-primary/10" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.4)]" onClick={handleSubmit} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create Key'}
          </Button>
        </div>
      </div>
    </div>
  );
}

