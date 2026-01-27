import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { globalRateLimiter, sensitiveDataFilter } from './rate-limiter.middleware';

const createMockReq = (overrides = {}): Request => ({
  ip: '192.168.1.1',
  socket: { remoteAddress: '192.168.1.1' },
  body: {},
  ...overrides,
} as unknown as Request);

const createMockRes = (): Response => {
  const res: Partial<Response> = {
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('globalRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows requests under the limit', () => {
    const req = createMockReq({ ip: '10.0.0.1' });
    const res = createMockRes();
    const next = vi.fn();

    globalRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('tracks requests per IP', () => {
    const req1 = createMockReq({ ip: '10.0.0.2' });
    const req2 = createMockReq({ ip: '10.0.0.3' });
    const res = createMockRes();
    const next = vi.fn();

    globalRateLimiter(req1, res, next);
    globalRateLimiter(req2, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it('uses socket remoteAddress as fallback', () => {
    const req = createMockReq({ ip: undefined, socket: { remoteAddress: '10.0.0.4' } });
    const res = createMockRes();
    const next = vi.fn();

    globalRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('sensitiveDataFilter', () => {
  it('redacts password fields', () => {
    const req = createMockReq({ body: { username: 'john', password: 'secret123' } });
    const res = createMockRes();
    const next = vi.fn();

    sensitiveDataFilter(req, res, next);

    expect(req.body.username).toBe('john');
    expect(req.body.password).toBe('[REDACTED]');
    expect(next).toHaveBeenCalled();
  });

  it('redacts apiKey fields', () => {
    const req = createMockReq({ body: { apiKey: 'vx_key123', name: 'test' } });
    const res = createMockRes();
    const next = vi.fn();

    sensitiveDataFilter(req, res, next);

    expect(req.body.apiKey).toBe('[REDACTED]');
    expect(req.body.name).toBe('test');
  });

  it('redacts nested sensitive data', () => {
    const req = createMockReq({
      body: { user: { token: 'abc123', name: 'test' } },
    });
    const res = createMockRes();
    const next = vi.fn();

    sensitiveDataFilter(req, res, next);

    expect(req.body.user.token).toBe('[REDACTED]');
    expect(req.body.user.name).toBe('test');
  });

  it('handles empty body', () => {
    const req = createMockReq({ body: null });
    const res = createMockRes();
    const next = vi.fn();

    sensitiveDataFilter(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('is case-insensitive', () => {
    const req = createMockReq({
      body: { PASSWORD: 'test', encryptedSecrets: 'data' },
    });
    const res = createMockRes();
    const next = vi.fn();

    sensitiveDataFilter(req, res, next);

    expect(req.body.PASSWORD).toBe('[REDACTED]');
    expect(req.body.encryptedSecrets).toBe('[REDACTED]');
  });
});
