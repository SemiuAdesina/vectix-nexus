'use client';

import { Button } from '@/components/ui/button';
import { Terminal, RefreshCw } from 'lucide-react';
import type { LogEntry } from '@/lib/api/types';

interface LogsPanelProps {
  logs: LogEntry[];
  isRunning: boolean;
  onRefresh: () => void;
}

export function LogsPanel({ logs, isRunning, onRefresh }: LogsPanelProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-medium">Live Logs</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <div className="bg-zinc-950 p-4 h-80 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-zinc-500">No logs available</p>
        ) : (
          logs.map((log, i) => (
            <LogLine key={i} log={log} />
          ))
        )}
        {isRunning && <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />}
      </div>
    </div>
  );
}

function LogLine({ log }: { log: LogEntry }) {
  const colorClass = log.level === 'error' 
    ? 'text-red-400' 
    : log.level === 'warn' 
    ? 'text-yellow-400' 
    : 'text-green-400';

  return (
    <div className={`py-1 ${colorClass}`}>
      <span className="text-zinc-600">
        [{new Date(log.timestamp).toLocaleTimeString()}]
      </span>{' '}
      {log.message}
    </div>
  );
}

