'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, Check, Loader2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiKeys, createApiKey, revokeApiKey, getApiConfig, ApiKeyData, ApiScope, ApiConfig } from '@/lib/api/api-keys';
import { CreateKeyModal } from '@/components/api-keys/create-key-modal';

function NewKeyModal({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(apiKey); setCopied(true); };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-green-400">API Key Created</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Copy this key now.</strong> For security, we don&apos;t store the full key and you won&apos;t be able to see it again.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <code className="flex-1 bg-[#1a1a2e] px-4 py-3 rounded-lg font-mono text-sm break-all select-all">{apiKey}</code>
          <Button variant={copied ? 'default' : 'outline'} onClick={copy} className="shrink-0">
            {copied ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
          </Button>
        </div>
        <Button className="w-full" onClick={onClose}>I&apos;ve saved my key</Button>
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

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
    setShowCreateModal(false);
  }

  async function handleRevoke(keyId: string) {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    await revokeApiKey(keyId);
    setKeys(prev => prev.filter(k => k.id !== keyId));
  }

  function copyPrefix(prefix: string, id: string) {
    navigator.clipboard.writeText(prefix);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Programmatic access to your Vectix agents</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Create Key</Button>
      </div>

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
                  <p className="text-xs text-muted-foreground">{apiKey.tier.toUpperCase()} | {apiKey.requestCount} requests</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => copyPrefix(apiKey.keyPrefix, apiKey.id)}>
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
              {apiKey.scopes.map(scope => <span key={scope} className="text-xs px-2 py-0.5 rounded bg-secondary">{scope}</span>)}
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

      {newKey && <NewKeyModal apiKey={newKey} onClose={() => setNewKey(null)} />}
    </div>
  );
}
