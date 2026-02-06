import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRoutes from './health.routes';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

const app = express();
app.use(healthRoutes);

describe('health routes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /ready returns connected when DB is ok', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }]);
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
    expect(res.body.database).toBe('connected');
  });

  it('GET /ready returns 503 when DB fails', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Connection refused'));
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.ready).toBe(false);
    expect(res.body.database).toBe('disconnected');
  });
});
