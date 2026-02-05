'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Loader2, Wallet, Terminal } from 'lucide-react';
import { startAgent, stopAgent, restartAgent } from '@/lib/api/agents';
import { useAgentLogs, calculateUptime } from '@/lib/hooks/use-agents';
import type { Agent } from '@/lib/api/types';
import Link from 'next/link';

interface AgentFleetCardProps {
  agent: Agent;
  onAction: () => void;
}

export function AgentFleetCard({ agent, onAction }: AgentFleetCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { logs } = useAgentLogs(agent.id, 1);
  const lastLog = logs[0];
  const isRunning = agent.status === 'running';
  const uptime = calculateUptime(agent.createdAt, agent.status);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(action);
    try {
      if (action === 'start') await startAgent(agent.id);
      else if (action === 'stop') await stopAgent(agent.id);
      else await restartAgent(agent.id);
      onAction();
    } catch (error) {
      console.error(`Failed to ${action} agent:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-w-0 rounded-2xl border border-primary/20 bg-card shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)] transition-all hover:border-primary/40 hover:shadow-[0_0_28px_-8px_hsl(var(--primary)_/_0.12)]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4 min-h-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <StatusBadge status={agent.status} />
            <div className="min-w-0">
              <Link href={`/dashboard/agents/${agent.id}`} className="hover:text-primary transition-colors">
                <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
              </Link>
              <p className="text-xs text-muted-foreground">{uptime}</p>
            </div>
          </div>
          <div className="shrink-0">
            <ActionButtons
              isRunning={isRunning}
              actionLoading={actionLoading}
              onAction={handleAction}
            />
          </div>
        </div>

        {agent.walletAddress && (
          <div className="flex items-center gap-2 text-xs mb-3 p-2.5 rounded-xl border border-primary/20 bg-background/80">
            <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono text-muted-foreground truncate">{agent.walletAddress}</span>
          </div>
        )}

        <MiniTerminal log={lastLog?.message} isRunning={isRunning} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isRunning = status === 'running';
  const isError = status === 'error';

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
      isRunning ? 'bg-primary/15 border-primary/30' : isError ? 'bg-destructive/10 border-destructive/30' : 'bg-background/80 border-primary/20'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full ${
        isRunning ? 'bg-primary animate-pulse' : isError ? 'bg-destructive' : 'bg-muted-foreground'
      }`} />
    </div>
  );
}

function ActionButtons({
  isRunning,
  actionLoading,
  onAction,
}: {
  isRunning: boolean;
  actionLoading: string | null;
  onAction: (action: 'start' | 'stop' | 'restart') => void;
}) {
  if (actionLoading) {
    return (
      <Button size="sm" variant="outline" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      {isRunning ? (
        <>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => onAction('restart')} title="Restart">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onAction('stop')} title="Stop">
            <Square className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary" onClick={() => onAction('start')} title="Start">
          <Play className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function MiniTerminal({ log, isRunning }: { log?: string; isRunning: boolean }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-background/80 p-3 font-mono text-xs">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        <Terminal className="w-3.5 h-3.5 text-primary" />
        <span>Latest Activity</span>
      </div>
      <p className={`truncate ${isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
        {log || (isRunning ? 'Awaiting next action...' : 'Agent offline')}
      </p>
    </div>
  );
}

