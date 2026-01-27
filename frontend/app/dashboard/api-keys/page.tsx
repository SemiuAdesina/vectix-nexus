'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiKeys, createApiKey, revokeApiKey, getApiConfig, ApiKeyData, ApiScope, ApiConfig } from '@/lib/api/api-keys';
import { CreateKeyModal } from '@/components/api-keys/create-key-modal';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [keysData, configData] = await Promise.all([getApiKeys(), getApiConfig()]);
    setKeys(keysData);
    setConfig(configData);
    setLoading(false);
  }

  async function handleCreate(name: string, scopes: ApiScope[]) {
    const result = await createApiKey(name, scopes);
    setNewKey(result.key);
    setKeys(prev => [result.data, ...prev]);
  }

  async function handleRevoke(keyId: string) {
    await revokeApiKey(keyId);
    setKeys(prev => prev.filter(k => k.id !== keyId));
  }

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">Programmatic access to your Vectix agents</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" /> Create Key</Button>
      </div>

      {newKey && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
          <p className="font-semibold text-green-400 mb-2">New API Key Created</p>
          <p className="text-sm text-muted-foreground mb-3">Copy this key now. You will not see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-secondary px-3 py-2 rounded font-mono text-sm">{newKey}</code>
            <Button variant="outline" size="sm" onClick={() => copyKey(newKey, 'new')}>
              {copied === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No API keys yet. Create one to get started.</div>
        ) : keys.map((apiKey) => (
          <div key={apiKey.id} className="p-5 border-b border-border last:border-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Key className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{apiKey.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {apiKey.tier.toUpperCase()} | {apiKey.requestCount} requests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowKeys(p => ({ ...p, [apiKey.id]: !p[apiKey.id] }))}>
                  {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => copyKey(apiKey.keyPrefix, apiKey.id)}>
                  {copied === apiKey.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevoke(apiKey.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-sm bg-secondary px-3 py-1.5 rounded font-mono">{apiKey.keyPrefix}</code>
              <span className="text-xs text-muted-foreground">
                {apiKey.lastUsedAt ? `Last used: ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : 'Never used'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {apiKey.scopes.map(scope => (
                <span key={scope} className="text-xs px-2 py-0.5 rounded bg-secondary">{scope}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {config && (
        <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm font-semibold mb-2">Rate Limits</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>Free: {config.rateLimits.free.daily}/day, {config.rateLimits.free.perMinute}/min</div>
            <div>Pro: {config.rateLimits.pro.daily}/day, {config.rateLimits.pro.perMinute}/min</div>
          </div>
        </div>
      )}

      {showCreateModal && config && (
        <CreateKeyModal config={config} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
