'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Agent, startAgent, stopAgent, restartAgent, deleteAgent } from '@/lib/api/client';
import { Play, Square, RefreshCw, Trash2, Loader2 } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onUpdate: () => void;
  onSelect: (agent: Agent) => void;
}

export function AgentCard({ agent, onUpdate, onSelect }: AgentCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: 'start' | 'stop' | 'restart' | 'delete') => {
    setLoading(action);
    try {
      if (action === 'start') await startAgent(agent.id);
      else if (action === 'stop') await stopAgent(agent.id);
      else if (action === 'restart') await restartAgent(agent.id);
      else if (action === 'delete' && confirm('Delete this agent permanently?')) await deleteAgent(agent.id);
      onUpdate();
    } catch (error) {
      console.error(`Failed to ${action} agent:`, error);
    } finally {
      setLoading(null);
    }
  };

  const statusConfig = {
    running: { color: 'bg-success', text: 'Running' },
    stopped: { color: 'bg-red-500', text: 'Stopped' },
    error: { color: 'bg-warning', text: 'Error' },
  }[agent.status];

  return (
    <div onClick={() => onSelect(agent)} className="glass rounded-lg p-5 hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{agent.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {agent.walletAddress ? `${agent.walletAddress.slice(0, 4)}...${agent.walletAddress.slice(-4)}` : 'No wallet'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
          <span className={`w-2 h-2 rounded-full ${statusConfig.color} ${agent.status === 'running' ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-medium">{statusConfig.text}</span>
        </div>
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {agent.status === 'stopped' && (
          <Button size="sm" onClick={() => handleAction('start')} disabled={loading !== null}
            className="flex-1 bg-success/20 text-success hover:bg-success/30 border-0">
            {loading === 'start' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Play className="w-3.5 h-3.5" /> Start</>}
          </Button>
        )}
        {agent.status === 'running' && (
          <>
            <Button size="sm" onClick={() => handleAction('restart')} disabled={loading !== null}
              className="flex-1 bg-primary/20 text-primary hover:bg-primary/30 border-0">
              {loading === 'restart' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><RefreshCw className="w-3.5 h-3.5" /> Restart</>}
            </Button>
            <Button size="sm" onClick={() => handleAction('stop')} disabled={loading !== null}
              className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0">
              {loading === 'stop' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Square className="w-3.5 h-3.5" /> Stop</>}
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" onClick={() => handleAction('delete')} disabled={loading !== null}
          className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 px-3">
          {loading === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}
