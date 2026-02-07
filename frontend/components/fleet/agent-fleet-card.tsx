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
    <div className="min-w-0 rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 shadow-xl transition-all hover:border-teal-500/30 hover:shadow-[0_0_28px_-8px_rgba(20,184,166,0.12)]">
      <div className="p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 min-h-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <StatusBadge status={agent.status} />
            <div className="min-w-0">
              <Link href={`/dashboard/agents/${agent.id}`} className="hover:text-teal-400 transition-colors">
                <h3 className="font-semibold text-sm sm:text-base text-white truncate">{agent.name}</h3>
              </Link>
              <p className="text-[11px] sm:text-xs text-slate-400">{uptime}</p>
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
          <div className="flex items-center gap-2 text-[10px] sm:text-xs mb-2.5 sm:mb-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-950/80 overflow-hidden">
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400 shrink-0" />
            <span className="font-mono text-slate-400 truncate">{agent.walletAddress}</span>
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
    <div
      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border shrink-0 ${
        isRunning
          ? 'bg-teal-500/15 border-teal-500/30'
          : isError
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-slate-800/80 border-slate-600'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          isRunning ? 'bg-teal-400 animate-pulse' : isError ? 'bg-red-500' : 'bg-slate-500'
        }`}
      />
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
      <Button size="sm" variant="outline" disabled className="border-slate-700 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      {isRunning ? (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-teal-500/10 hover:text-teal-400"
            onClick={() => onAction('restart')}
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onAction('stop')}
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg text-teal-400 hover:bg-teal-500/10 hover:text-teal-400"
          onClick={() => onAction('start')}
          title="Start"
        >
          <Play className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function MiniTerminal({ log, isRunning }: { log?: string; isRunning: boolean }) {
  return (
    <div className="rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-950/80 p-2.5 sm:p-3 font-mono text-[11px] sm:text-xs">
      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-1 sm:mb-1.5">
        <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400" />
        <span>Latest Activity</span>
      </div>
      <p className={`truncate ${isRunning ? 'text-teal-400' : 'text-slate-500'}`}>
        {log || (isRunning ? 'Awaiting next action...' : 'Agent offline')}
      </p>
    </div>
  );
}
