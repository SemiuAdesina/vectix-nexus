import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getOpik } from '../lib/opik';

const router = Router();

router.get('/opik-test', (_req: Request, res: Response) => {
  const opik = getOpik();
  if (!opik) {
    return res.status(200).json({ ok: false, message: 'Opik disabled (OPIK_API_KEY not set)' });
  }
  const trace = opik.trace({ name: 'opik-test', input: {} });
  trace.end();
  res.status(200).json({ ok: true, message: 'Trace sent. Refresh Opik dashboard.' });
});

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      ready: true,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      ready: false,
      database: 'disconnected',
      error: err instanceof Error ? err.message : 'Database check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
