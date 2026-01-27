'use client';

import { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWebhooks, createWebhook, deleteWebhook, WebhookData } from '@/lib/api/api-keys';

const EVENTS = ['agent.started', 'agent.stopped', 'agent.crashed', 'trade.executed', 'trade.failed'];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    setLoading(true);
    const data = await getWebhooks();
    setWebhooks(data);
    setLoading(false);
  }

  async function handleCreate() {
    if (!newUrl || newEvents.length === 0) return;
    const result = await createWebhook(newUrl, newEvents);
    setNewSecret(result.secret || null);
    setWebhooks(prev => [result, ...prev]);
    setNewUrl('');
    setNewEvents([]);
  }

  async function handleDelete(id: string) {
    await deleteWebhook(id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
  }

  function copySecret() {
    if (newSecret) navigator.clipboard.writeText(newSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Webhooks</h1>
          <p className="text-muted-foreground">Receive real-time notifications for agent events</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="w-4 h-4 mr-2" /> Add Webhook</Button>
      </div>

      {newSecret && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
          <p className="font-semibold text-green-400 mb-2">Webhook Created</p>
          <p className="text-sm text-muted-foreground mb-3">Copy this secret to verify webhook signatures.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-secondary px-3 py-2 rounded font-mono text-sm">{newSecret}</code>
            <Button variant="outline" size="sm" onClick={copySecret}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="mb-6 p-4 rounded-lg glass border border-border">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Endpoint URL</label>
              <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Events</label>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map(event => (
                  <label key={event} className={`px-3 py-1.5 rounded-full cursor-pointer text-sm ${
                    newEvents.includes(event) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <input type="checkbox" className="sr-only" checked={newEvents.includes(event)}
                      onChange={() => setNewEvents(p => p.includes(event) ? p.filter(e => e !== event) : [...p, event])} />
                    {event}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!newUrl || newEvents.length === 0}>Create Webhook</Button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        {webhooks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No webhooks configured.</div>
        ) : webhooks.map((webhook) => (
          <div key={webhook.id} className="p-5 border-b border-border last:border-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-sm">{webhook.url}</p>
                  <p className="text-xs text-muted-foreground">Created {new Date(webhook.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(webhook.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {webhook.events.map(event => (
                <span key={event} className="text-xs px-2 py-0.5 rounded bg-secondary">{event}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

