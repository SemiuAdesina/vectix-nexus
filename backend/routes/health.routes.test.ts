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

vi.mock('../lib/opik', () => ({
  getOpik: vi.fn(),
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

  it('GET /opik-test returns ok false when Opik disabled', async () => {
    const { getOpik } = await import('../lib/opik');
    vi.mocked(getOpik).mockReturnValue(null);
    const res = await request(app).get('/opik-test');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toContain('OPIK_API_KEY');
  });

  it('GET /opik-test sends trace and returns ok when Opik enabled', async () => {
    const { getOpik } = await import('../lib/opik');
    const end = vi.fn();
    vi.mocked(getOpik).mockReturnValue({ trace: () => ({ end }) } as never);
    const res = await request(app).get('/opik-test');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(end).toHaveBeenCalled();
  });
});
