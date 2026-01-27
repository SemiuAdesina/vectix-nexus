import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/logger', () => ({
    logger: {
        request: vi.fn(),
        response: vi.fn(),
        debug: vi.fn(),
        error: vi.fn()
    }
}));

import { logger } from '../lib/logger';
import { requestLogger, errorLogger } from './request-logger.middleware';

const mockRequest = (overrides = {}) => ({
    method: 'GET',
    path: '/test',
    headers: {},
    body: {},
    ...overrides
});

const mockResponse = () => {
    const res: any = {
        statusCode: 200,
        end: vi.fn()
    };
    return res;
};

const mockNext = vi.fn();

describe('request-logger.middleware', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('requestLogger', () => {
        it('logs request on entry', () => {
            const req = mockRequest({ headers: { 'x-request-id': 'req-123' } });
            const res = mockResponse();
            requestLogger(req as any, res as any, mockNext);
            expect(logger.request).toHaveBeenCalledWith('GET', '/test', expect.objectContaining({ requestId: 'req-123' }));
            expect(mockNext).toHaveBeenCalled();
        });

        it('logs response on end', () => {
            const req = mockRequest();
            const res = mockResponse();
            requestLogger(req as any, res as any, mockNext);
            res.end();
            expect(logger.response).toHaveBeenCalledWith('GET', '/test', 200, expect.any(Number), expect.any(Object));
        });

        it('logs debug body when LOG_LEVEL is debug', () => {
            vi.stubEnv('LOG_LEVEL', 'debug');
            const req = mockRequest({ body: { name: 'test' } });
            const res = mockResponse();
            requestLogger(req as any, res as any, mockNext);
            expect(logger.debug).toHaveBeenCalled();
        });

        it('redacts sensitive data from body', () => {
            vi.stubEnv('LOG_LEVEL', 'debug');
            const req = mockRequest({ body: { password: 'secret123', name: 'test' } });
            const res = mockResponse();
            requestLogger(req as any, res as any, mockNext);
            const debugCall = vi.mocked(logger.debug).mock.calls[0];
            const metadata = debugCall?.[1] as { metadata?: { password?: string; name?: string } } | undefined;
            expect(metadata?.metadata?.password).toBe('[REDACTED]');
            expect(metadata?.metadata?.name).toBe('test');
        });
    });

    describe('errorLogger', () => {
        it('logs error with context', () => {
            const err = new Error('Test error');
            const req = mockRequest({ headers: { 'x-request-id': 'req-err' } });
            const res = mockResponse();
            errorLogger(err, req as any, res as any, mockNext);
            expect(logger.error).toHaveBeenCalledWith('Error: Test error', expect.objectContaining({ context: 'ERROR' }));
            expect(mockNext).toHaveBeenCalledWith(err);
        });

        it('includes stack trace in development', () => {
            vi.stubEnv('NODE_ENV', 'development');
            const err = new Error('Dev error');
            const req = mockRequest();
            const res = mockResponse();
            errorLogger(err, req as any, res as any, mockNext);
            const logCall = vi.mocked(logger.error).mock.calls[0];
            const meta = logCall?.[1] as { metadata?: { stack?: string } } | undefined;
            expect(meta?.metadata?.stack).toBeDefined();
        });
    });
});
