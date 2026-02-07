'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white">API Keys</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Create Key
          </button>
        </div>
        <p className="text-xs sm:text-base text-slate-400">Programmatic access to your Vectix agents</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
      </div>

      {newKey && (
        <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-teal-500/30 bg-teal-500/10 shadow-[0_0_20px_-8px_rgba(20,184,166,0.15)]">
          <p className="text-sm sm:text-base font-semibold text-teal-400 mb-1.5 sm:mb-2">New API Key Created</p>
          <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">Copy this key now. You will not see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 bg-slate-800/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-[10px] sm:text-sm border border-slate-700 text-white truncate">{newKey}</code>
            <button
              type="button"
              onClick={() => copyKey(newKey, 'new')}
              className="p-1.5 sm:px-3 sm:py-2 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white transition-colors shrink-0"
            >
              {copied === 'new' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
        {keys.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-xs sm:text-base text-slate-400">No API keys yet. Create one to get started.</div>
        ) : keys.filter((k): k is ApiKeyData => !!(k && k.id && typeof (k as ApiKeyData).name === 'string')).map((apiKey) => (
          <div key={apiKey.id} className="p-3.5 sm:p-5 border-b border-slate-700/50 last:border-0">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-white truncate">{apiKey.name}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    {(apiKey.tier ?? 'free').toUpperCase()} | {typeof apiKey.requestCount === 'number' ? apiKey.requestCount : 0} requests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowKeys(p => ({ ...p, [apiKey.id]: !p[apiKey.id] }))}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 text-slate-400 transition-colors"
                >
                  {showKeys[apiKey.id] ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyKey(apiKey.keyPrefix, apiKey.id)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 text-slate-400 transition-colors"
                >
                  {copied === apiKey.id ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleRevoke(apiKey.id)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-[10px] sm:text-sm bg-slate-800/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-mono border border-slate-700 text-white truncate min-w-0">{apiKey.keyPrefix}</code>
              <span className="text-[10px] sm:text-xs text-slate-400 shrink-0">
                {apiKey.lastUsedAt ? `Last used: ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : 'Never used'}
              </span>
            </div>
            <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
              {Array.isArray(apiKey.scopes) && apiKey.scopes.map(scope => (
                <span key={scope} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400">{scope}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {config && (
        <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            </div>
            <h2 className="text-sm sm:text-xl font-semibold text-white">Rate Limits</h2>
          </div>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <span className="text-slate-400">Free</span>
              <span className="font-medium text-white">{config.rateLimits.free.daily}/day, {config.rateLimits.free.perMinute}/min</span>
            </div>
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <span className="text-slate-400">Pro</span>
              <span className="font-medium text-white">{config.rateLimits.pro.daily}/day, {config.rateLimits.pro.perMinute}/min</span>
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
