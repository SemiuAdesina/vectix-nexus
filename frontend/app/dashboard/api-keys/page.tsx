'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiKeys, createApiKey, revokeApiKey, getApiConfig, ApiKeyData, ApiScope, ApiConfig } from '@/lib/api/api-keys';
import { CreateKeyModal } from '@/components/api-keys/create-key-modal';

export default function ApiKeysPage() {
  const { getToken } = useAuth();
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
    try {
      const [keysData, configData] = await Promise.all([getApiKeys(), getApiConfig()]);
      setKeys(Array.isArray(keysData) ? keysData.filter((k): k is ApiKeyData => k != null && typeof k?.name === 'string') : []);
      setConfig(configData ?? null);
    } catch {
      setKeys([]);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(name: string, scopes: ApiScope[]) {
    const token = await getToken();
    if (!token) {
      throw new Error('Please sign in to create API keys.');
    }
    const result = await createApiKey(name, scopes, token);
    if (result?.key) setNewKey(result.key);
    if (result?.data) setKeys(prev => [result.data, ...prev]);
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
    <div className="w-full space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.4)]"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Key
          </Button>
        </div>
        <p className="text-muted-foreground">Programmatic access to your Vectix agents</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      {newKey && (
        <div className="p-5 rounded-2xl border border-green-500/30 bg-green-500/10 shadow-[0_0_20px_-8px_rgba(20,184,166,0.15)]">
          <p className="font-semibold text-green-400 mb-2">New API Key Created</p>
          <p className="text-sm text-muted-foreground mb-3">Copy this key now. You will not see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background/80 px-3 py-2 rounded-xl font-mono text-sm border border-primary/20">{newKey}</code>
            <Button variant="outline" size="sm" onClick={() => copyKey(newKey, 'new')} className="border-primary/30 hover:bg-primary/10">
              {copied === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
        {keys.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No API keys yet. Create one to get started.</div>
        ) : keys.filter((k): k is ApiKeyData => !!(k && k.id && typeof (k as ApiKeyData).name === 'string')).map((apiKey) => (
          <div key={apiKey.id} className="p-5 border-b border-primary/20 last:border-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{apiKey.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(apiKey.tier ?? 'free').toUpperCase()} | {typeof apiKey.requestCount === 'number' ? apiKey.requestCount : 0} requests
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
              <code className="text-sm bg-background/80 px-3 py-1.5 rounded-lg font-mono border border-primary/20">{apiKey.keyPrefix}</code>
              <span className="text-xs text-muted-foreground">
                {apiKey.lastUsedAt ? `Last used: ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : 'Never used'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.isArray(apiKey.scopes) && apiKey.scopes.map(scope => (
                <span key={scope} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary">{scope}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {config && (
        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Rate Limits</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-background/50 hover:border-primary/40 transition-colors">
              <span className="text-muted-foreground">Free</span>
              <span className="font-medium text-foreground">{config.rateLimits.free.daily}/day, {config.rateLimits.free.perMinute}/min</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-background/50 hover:border-primary/40 transition-colors">
              <span className="text-muted-foreground">Pro</span>
              <span className="font-medium text-foreground">{config.rateLimits.pro.daily}/day, {config.rateLimits.pro.perMinute}/min</span>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && config && (
        <CreateKeyModal config={config} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
