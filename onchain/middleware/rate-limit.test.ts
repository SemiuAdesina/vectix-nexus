import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { onchainRateLimit } from './rate-limit';

function mockReq(ip = '127.0.0.1'): Partial<Request> {
  return {
    ip,
    socket: { remoteAddress: ip } as unknown as Request['socket'],
  };
}

function mockRes(): { res: Partial<Response>; next: NextFunction; statusMock: ReturnType<typeof vi.fn>; jsonMock: ReturnType<typeof vi.fn>; setHeaderMock: ReturnType<typeof vi.fn> } {
  const statusMock = vi.fn().mockReturnThis();
  const jsonMock = vi.fn().mockReturnThis();
  const setHeaderMock = vi.fn().mockReturnThis();
  return {
    res: {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    },
    next: vi.fn(),
    statusMock,
    jsonMock,
    setHeaderMock,
  };
}

describe('onchainRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('calls next when under limit', () => {
    const { res, next } = mockRes();
    onchainRateLimit(
      mockReq() as Request,
      res as Response,
      next as NextFunction
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 429 and Retry-After after exceeding limit', () => {
    const req = mockReq('192.168.1.1') as Request;
    const { res, next } = mockRes();

    for (let i = 0; i < 60; i++) {
      onchainRateLimit(req, res as Response, next as NextFunction);
    }
    expect(next).toHaveBeenCalledTimes(60);

    onchainRateLimit(req, res as Response, next as NextFunction);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Too many requests' });
    expect(next).toHaveBeenCalledTimes(60);
  });

  it('allows requests from different IPs independently', () => {
    const { res: resA, next: nextA } = mockRes();
    const { res: resB, next: nextB } = mockRes();

    for (let i = 0; i < 60; i++) {
      onchainRateLimit(mockReq('10.0.0.1') as Request, resA as Response, nextA as NextFunction);
      onchainRateLimit(mockReq('10.0.0.2') as Request, resB as Response, nextB as NextFunction);
    }
    expect(nextA).toHaveBeenCalledTimes(60);
    expect(nextB).toHaveBeenCalledTimes(60);
    expect(resA.status).not.toHaveBeenCalled();
    expect(resB.status).not.toHaveBeenCalled();
  });
});
