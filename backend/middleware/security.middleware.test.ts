import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  securityHeaders,
  secureCors,
  requestIdMiddleware,
  globalRateLimiter,
} from './security.middleware';

const createMockReq = (overrides: Partial<Request> = {}): Request => ({
  headers: {},
  method: 'GET',
  ip: '127.0.0.1',
  socket: { remoteAddress: '127.0.0.1' },
  ...overrides,
} as unknown as Request);

const createMockRes = (): Response => {
  const res: Partial<Response> = {
    locals: {},
    setHeader: vi.fn().mockReturnThis(),
    removeHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('securityHeaders', () => {
  it('sets security headers', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders()(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.stringContaining('max-age=31536000')
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(next).toHaveBeenCalled();
  });
});

describe('secureCors', () => {
  it('allows trusted origins', () => {
    const req = createMockReq({ headers: { origin: 'http://localhost:3000' } });
    const res = createMockRes();
    const next = vi.fn();

    secureCors({ trustedOrigins: ['http://localhost:3000'] })(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://localhost:3000'
    );
    expect(next).toHaveBeenCalled();
  });

  it('handles OPTIONS requests', () => {
    const req = createMockReq({ method: 'OPTIONS', headers: {} });
    const res = createMockRes();
    const next = vi.fn();

    secureCors()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requestIdMiddleware', () => {
  it('generates request ID if not present', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.headers['x-request-id']).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('preserves existing request ID', () => {
    const req = createMockReq({ headers: { 'x-request-id': 'existing-id' } });
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.headers['x-request-id']).toBe('existing-id');
  });
});

describe('globalRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under limit', async () => {
    const req = createMockReq({ ip: '192.168.1.1' });
    const res = createMockRes();
    const next = vi.fn();

    await globalRateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
