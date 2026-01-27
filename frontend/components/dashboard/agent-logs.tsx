'use client';

import { useState, useEffect, useRef } from 'react';
import { LogEntry, getAgentLogs } from '@/lib/api/client';
import { Terminal, Radio } from 'lucide-react';

interface AgentLogsProps {
  agentId: string;
  isRunning: boolean;
}

export function AgentLogs({ agentId, isRunning }: AgentLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getAgentLogs(agentId, { limit: 100 });
        setLogs(response.logs);
      } catch { setLogs([]); }
      finally { setLoading(false); }
    };
    fetchLogs();
    if (isRunning) {
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [agentId, isRunning]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const levelStyles = {
    error: 'text-red-400',
    warn: 'text-yellow-400',
    info: 'text-success',
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
        <span className="text-sm font-medium font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4" /> Agent Logs
        </span>
        {isRunning && (
          <span className="flex items-center gap-2 text-xs text-success">
            <Radio className="w-3 h-3 animate-pulse" /> Live
          </span>
        )}
      </div>
      <div className="bg-background h-[350px] overflow-y-auto p-4 font-mono text-xs">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No logs available</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-3 py-0.5 hover:bg-secondary/50 px-2 -mx-2 rounded">
              <span className="text-muted-foreground/50 select-none">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={levelStyles[log.level]}>[{log.level.toUpperCase()}]</span>
              <span className="text-foreground/80">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
