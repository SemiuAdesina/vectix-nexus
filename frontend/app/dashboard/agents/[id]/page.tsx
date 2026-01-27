'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgent } from '@/lib/api/agents';
import type { Agent } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { AgentDetail } from '@/components/dashboard/agent-detail';
import Link from 'next/link';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentData = await getAgent(agentId);
        setAgent(agentData);
      } catch (error) {
        console.error('Failed to fetch agent:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agentId]);

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
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/agents" className="text-muted-foreground hover:text-foreground transition-colors">
          <Button variant="ghost" size="sm" className="pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Agents
          </Button>
        </Link>
      </div>

      <AgentDetail
        agent={agent}
        onClose={() => router.push('/dashboard/agents')}
      />
    </div>
  );
}
