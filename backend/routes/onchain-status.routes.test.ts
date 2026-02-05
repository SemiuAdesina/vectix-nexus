import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import router from './onchain.routes';

describe('onchain-status.routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('GET /onchain/status returns enabled status with programId when set', () => {
    process.env.SOLANA_PROGRAM_ID = 'Prog111111111111111111111111111';
    const route = router.stack.find((r) => r.route?.path === '/onchain/status');
    expect(route).toBeDefined();
    const req = {} as Request;
    const res = { json: vi.fn() } as unknown as Response;
    (route as unknown as { route: { stack: [{ handle: (req: Request, res: Response) => void }] } }).route.stack[0].handle(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      enabled: true,
      message: 'On-chain verification is active',
      programId: 'Prog111111111111111111111111111',
    });
  });

  it('GET /onchain/status returns programId null when SOLANA_PROGRAM_ID unset', () => {
    delete process.env.SOLANA_PROGRAM_ID;
    const route = router.stack.find((r) => r.route?.path === '/onchain/status');
    expect(route).toBeDefined();
    const req = {} as Request;
    const res = { json: vi.fn() } as unknown as Response;
    (route as unknown as { route: { stack: [{ handle: (req: Request, res: Response) => void }] } }).route.stack[0].handle(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, enabled: true, programId: null })
    );
  });
});
