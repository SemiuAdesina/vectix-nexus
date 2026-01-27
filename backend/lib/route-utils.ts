import { Request, Response } from 'express';
import { getUserIdFromRequest } from './auth';
import { prisma } from './prisma';

export function handleError(res: Response, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return res.status(500).json({ error: errorMessage });
}

export async function requireAuth(req: Request, res: Response): Promise<string | null> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return userId;
}

export async function findUserAgent(userId: string, agentId: string, res: Response) {
  const agent = await prisma.agent.findFirst({ where: { id: agentId, userId } });
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return null;
  }
  return agent;
}

