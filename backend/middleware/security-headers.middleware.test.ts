import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { securityHeaders, requestIdMiddleware } from './security-headers.middleware';

const createMockReq = (overrides = {}): Request => ({
  headers: {},
  method: 'GET',
  ...overrides,
} as unknown as Request);

const createMockRes = (): Response => {
  const res: Partial<Response> = {
    locals: {},
    setHeader: vi.fn().mockReturnThis(),
    removeHeader: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('securityHeaders', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockReq();
    res = createMockRes();
    next = vi.fn();
  });

  it('sets HSTS header by default', () => {
    securityHeaders()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  });

  it('sets CSP header with nonce', () => {
    securityHeaders()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'")
    );
    expect(res.locals.cspNonce).toBeDefined();
  });

  it('sets X-Frame-Options header', () => {
    securityHeaders()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
  });

  it('sets X-Content-Type-Options header', () => {
    securityHeaders()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
  });

  it('sets X-XSS-Protection header', () => {
    securityHeaders()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
  });

  it('removes X-Powered-By header', () => {
    securityHeaders()(req, res, next);
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
  });

  it('sets Referrer-Policy header', () => {
    securityHeaders()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    );
  });

  it('respects config to disable headers', () => {
    securityHeaders({ enableHsts: false, enableCsp: false })(req, res, next);
    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.any(String)
    );
  });

  it('calls next()', () => {
    securityHeaders()(req, res, next);
    expect(next).toHaveBeenCalled();
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
    const req = createMockReq({ headers: { 'x-request-id': 'existing-123' } });
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.headers['x-request-id']).toBe('existing-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'existing-123');
  });
});
