import { Router, Request, Response } from 'express';
import { getUserIdFromRequest } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { startMachine, stopMachine, restartMachine, getMachineStatus, destroyMachine } from '../services/fly-lifecycle';
import { getMachineLogs, appendDockerActivity } from '../services/fly-logs';
import { getParam } from '../lib/route-helpers';

const router = Router();
const err = (e: unknown) => (e instanceof Error ? e.message : 'Unknown error');

router.get('/agents', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agents = await prisma.agent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return res.json({ agents });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.get('/agents/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    return res.json({ agent });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.post('/agents/:id/start', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.machineId) return res.status(404).json({ error: 'Agent not found' });
    await startMachine(agent.machineId);
    await prisma.agent.update({ where: { id: agent.id }, data: { status: 'running' } });
    return res.json({ success: true, status: 'running' });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.post('/agents/:id/stop', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.machineId) return res.status(404).json({ error: 'Agent not found' });
    await stopMachine(agent.machineId);
    await prisma.agent.update({ where: { id: agent.id }, data: { status: 'stopped' } });
    return res.json({ success: true, status: 'stopped' });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.post('/agents/:id/restart', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.machineId) return res.status(404).json({ error: 'Agent not found' });
    await restartMachine(agent.machineId);
    await prisma.agent.update({ where: { id: agent.id }, data: { status: 'running' } });
    return res.json({ success: true, status: 'running' });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.delete('/agents/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.machineId) { try { await destroyMachine(agent.machineId); } catch { /* ignore */ } }
    await prisma.agent.delete({ where: { id: agent.id } });
    return res.json({ success: true });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.get('/agents/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.machineId) return res.status(404).json({ error: 'Agent not found' });
    const status = await getMachineStatus(agent.machineId);
    if (status.state !== agent.status) {
      await prisma.agent.update({ where: { id: agent.id }, data: { status: status.state === 'started' ? 'running' : 'stopped' } });
    }
    return res.json({ status: status.state, region: status.region, updatedAt: status.updatedAt });
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.get('/agents/:id/logs', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.machineId) return res.status(404).json({ error: 'Agent not found' });
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await getMachineLogs(agent.machineId, undefined, { limit, nextToken: req.query.nextToken as string });
    return res.json(logs);
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

router.post('/agents/:id/activity', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.machineId) return res.status(404).json({ error: 'Agent not found' });
    const message = typeof (req.body as { message?: string }).message === 'string'
      ? (req.body as { message: string }).message.trim()
      : '';
    if (!message) return res.status(400).json({ error: 'message is required' });
    appendDockerActivity(agent.machineId, { message });
    return res.status(204).send();
  } catch (error) { return res.status(500).json({ error: err(error) }); }
});

export default router;
