import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, asyncHandler, notFoundHandler } from './error-handler';

const createMockReq = (overrides = {}): Request => ({
  method: 'GET',
  path: '/test',
  ip: '127.0.0.1',
  headers: { 'user-agent': 'Test' },
  ...overrides,
} as unknown as Request);

const createMockRes = (): Response & { statusCode: number; body: unknown } => {
  const res = {
    statusCode: 0,
    body: null as unknown,
    status: vi.fn().mockImplementation(function (this: Response, code: number) {
      (this as Response & { statusCode: number }).statusCode = code;
      return this;
    }),
    json: vi.fn().mockImplementation(function (this: Response, data: unknown) {
      (this as Response & { body: unknown }).body = data;
      return this;
    }),
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
};

describe('AppError', () => {
  it('creates bad request error', () => {
    const error = AppError.badRequest('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.message).toBe('Invalid input');
  });

  it('creates unauthorized error', () => {
    const error = AppError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('creates not found error', () => {
    const error = AppError.notFound('User');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('creates rate limit error with retry', () => {
    const error = AppError.tooManyRequests(60);
    expect(error.statusCode).toBe(429);
    expect((error as AppError & { retryAfter: number }).retryAfter).toBe(60);
  });
});

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('handles AppError correctly', () => {
    const req = createMockReq();
    const res = createMockRes();
    const error = AppError.badRequest('Test error');

    errorHandler(error, req, res, vi.fn());

    expect(res.statusCode).toBe(400);
    expect((res.body as { error: { code: string } }).error.code).toBe('BAD_REQUEST');
  });

  it('handles generic errors without leaking details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const req = createMockReq();
    const res = createMockRes();
    const error = new Error('Database connection failed: password invalid');

    errorHandler(error, req, res, vi.fn());

    expect(res.statusCode).toBe(500);
    expect((res.body as { error: { message: string } }).error.message).toBe('An unexpected error occurred');

    process.env.NODE_ENV = originalEnv;
  });

  it('generates unique error IDs', () => {
    const req = createMockReq();
    const res1 = createMockRes();
    const res2 = createMockRes();

    errorHandler(new Error('Test'), req, res1, vi.fn());
    errorHandler(new Error('Test'), req, res2, vi.fn());

    const id1 = (res1.body as { error: { errorId: string } }).error.errorId;
    const id2 = (res2.body as { error: { errorId: string } }).error.errorId;
    expect(id1).not.toBe(id2);
  });
});

describe('asyncHandler', () => {
  it('handles async functions', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const wrapped = asyncHandler(mockFn);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    wrapped(req, res as Response, next);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockFn).toHaveBeenCalled();
  });

  it('catches errors and passes to next', async () => {
    const error = new Error('Async error');
    const mockFn = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(mockFn);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    wrapped(req, res as Response, next);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('notFoundHandler', () => {
  it('returns 404 with route info', () => {
    const req = createMockReq({ method: 'POST', path: '/unknown' });
    const res = createMockRes();

    notFoundHandler(req, res as Response);

    expect(res.statusCode).toBe(404);
    expect((res.body as { error: { message: string } }).error.message).toContain('POST /unknown');
  });
});
