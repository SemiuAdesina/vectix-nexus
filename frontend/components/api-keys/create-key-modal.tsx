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

  function toggleScope(scope: ApiScope) {
    setSelectedScopes(prev => 
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || selectedScopes.length === 0) return;
    setCreating(true);
    await onCreate(name, selectedScopes);
    setCreating(false);
    onClose();
  }

  const allScopes = Object.keys(config.scopes) as ApiScope[];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create API Key</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Key Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production Key"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Permissions</label>
            <div className="space-y-2">
              {allScopes.map(scope => {
                const isPro = !config.tiers.free.includes(scope);
                return (
                  <label 
                    key={scope} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScopes.includes(scope) ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50'
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
                      <p className="text-sm font-medium">{scope}</p>
                      <p className="text-xs text-muted-foreground">{config.scopes[scope]}</p>
                    </div>
                    {isPro && <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">PRO</span>}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create Key'}
          </Button>
        </div>
      </div>
    </div>
  );
}

