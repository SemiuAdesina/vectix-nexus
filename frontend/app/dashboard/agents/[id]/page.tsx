'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgent, startAgent, stopAgent, restartAgent, deleteAgent, getAgentLogs } from '@/lib/api/agents';
import { getAgentBalance } from '@/lib/api/wallet';
import type { Agent, LogEntry } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { LogsPanel, WalletPanel, DangerZone, AgentHeader } from '@/components/agent-detail';
import Link from 'next/link';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [agentData, logsData] = await Promise.all([
        getAgent(agentId),
        getAgentLogs(agentId, { limit: 20 }),
      ]);
      setAgent(agentData);
      setLogs(logsData.logs);
      try {
        const balanceData = await getAgentBalance(agentId);
        setBalance(balanceData.sol);
      } catch {
        setBalance(0);
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (action: string) => {
    if (!agent) return;
    setActionLoading(action);
    try {
      if (action === 'start') await startAgent(agent.id);
      else if (action === 'stop') await stopAgent(agent.id);
      else if (action === 'restart') await restartAgent(agent.id);
      else if (action === 'delete') {
        await deleteAgent(agent.id);
        router.push('/dashboard');
        return;
      }
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Agent not found</p>
        <Link href="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <AgentHeader agent={agent} isRunning={agent.status === 'running'} actionLoading={actionLoading} onAction={handleAction} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LogsPanel logs={logs} isRunning={agent.status === 'running'} onRefresh={fetchData} />
        </div>
        <div className="space-y-4">
          <WalletPanel address={agent.walletAddress} balance={balance} />
          <DangerZone onDelete={() => handleAction('delete')} isDeleting={actionLoading === 'delete'} />
        </div>
      </div>
    </div>
  );
}
