'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Square, RotateCcw, Loader2 } from 'lucide-react';
import type { Agent } from '@/lib/api/types';
import Link from 'next/link';

interface AgentHeaderProps {
  agent: Agent;
  isRunning: boolean;
  actionLoading: string | null;
  onAction: (action: string) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  running: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success animate-pulse' },
  stopped: { bg: 'bg-secondary', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  error: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
};

export function AgentHeader({ agent, isRunning, actionLoading, onAction }: AgentHeaderProps) {
  const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.stopped;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {isRunning ? (
          <>
            <ActionBtn icon={RotateCcw} label="Restart" action="restart" loading={actionLoading} onClick={onAction} />
            <ActionBtn icon={Square} label="Stop" action="stop" loading={actionLoading} onClick={onAction} variant="destructive" />
          </>
        ) : (
          <ActionBtn icon={Play} label="Start" action="start" loading={actionLoading} onClick={onAction} />
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, action, loading, onClick, variant = 'outline' }: {
  icon: React.ElementType; label: string; action: string; loading: string | null;
  onClick: (action: string) => void; variant?: 'outline' | 'default' | 'destructive';
}) {
  return (
    <Button variant={variant} onClick={() => onClick(action)} disabled={!!loading}>
      {loading === action ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </Button>
  );
}

