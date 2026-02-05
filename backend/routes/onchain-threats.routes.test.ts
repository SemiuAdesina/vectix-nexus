import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import router from './onchain.routes';

describe('onchain-threats.routes', () => {
  it('GET /onchain/threats/feed returns success and empty threats', () => {
    const route = router.stack.find((r) => r.route?.path === '/onchain/threats/feed');
    expect(route).toBeDefined();
    const req = {} as Request;
    const res = { json: vi.fn() } as unknown as Response;
    (route as unknown as { route: { stack: [{ handle: (req: Request, res: Response) => void }] } }).route.stack[0].handle(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, threats: [] });
  });

  it('POST /onchain/threats/detect returns stub response', () => {
    const route = router.stack.find((r) => r.route?.path === '/onchain/threats/detect');
    expect(route).toBeDefined();
    const req = {} as Request;
    const res = { json: vi.fn() } as unknown as Response;
    (route as unknown as { route: { stack: [{ handle: (req: Request, res: Response) => void }] } }).route.stack[0].handle(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, isAnomaly: false, confidence: 0 })
    );
  });
});
