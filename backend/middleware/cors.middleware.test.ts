import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { secureCors } from './cors.middleware';

const createMockReq = (overrides = {}): Request => ({
  headers: {},
  method: 'GET',
  ...overrides,
} as unknown as Request);

const createMockRes = (): Response => {
  const res: Partial<Response> = {
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

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
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    expect(next).toHaveBeenCalled();
  });

  it('does not set origin for untrusted origins', () => {
    const req = createMockReq({ headers: { origin: 'http://evil.com' } });
    const res = createMockRes();
    const next = vi.fn();

    secureCors({ trustedOrigins: ['http://localhost:3000'] })(req, res, next);

    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://evil.com'
    );
    expect(next).toHaveBeenCalled();
  });

  it('sets allowed methods', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    secureCors()(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
  });

  it('sets allowed headers', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    secureCors()(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-API-Key, X-Request-ID'
    );
  });

  it('handles OPTIONS preflight requests', () => {
    const req = createMockReq({ method: 'OPTIONS' });
    const res = createMockRes();
    const next = vi.fn();

    secureCors()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('sets Vary header', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    secureCors()(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
  });
});
