import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/api-keys/api-key.service', () => ({
    validateApiKey: vi.fn()
}));

vi.mock('../services/api-keys/api-key.types', () => ({
    RATE_LIMITS: { free: { perMinute: 10 }, pro: { perMinute: 100 } }
}));

import { validateApiKey } from '../services/api-keys/api-key.service';
import { apiKeyAuth, requireScope, requireTier, requirePollingInterval, ApiAuthRequest } from './api-auth.middleware';

const mockRequest = (headers = {}, apiAuth?: any) => ({
    headers,
    apiAuth,
    path: '/test'
} as ApiAuthRequest);

const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockNext = vi.fn();

describe('api-auth.middleware', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('apiKeyAuth', () => {
        it('returns 401 for missing API key', async () => {
            const req = mockRequest({});
            const res = mockResponse();
            await apiKeyAuth(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('returns 401 for invalid key format', async () => {
            const req = mockRequest({ 'x-api-key': 'invalid' });
            const res = mockResponse();
            await apiKeyAuth(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('returns 401 when validation fails', async () => {
            vi.mocked(validateApiKey).mockResolvedValue(null);
            const req = mockRequest({ 'x-api-key': 'vx_test123' });
            const res = mockResponse();
            await apiKeyAuth(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('sets apiAuth and calls next on valid key', async () => {
            vi.mocked(validateApiKey).mockResolvedValue({ userId: 'u1', scopes: ['read:agents'], tier: 'pro' });
            const req = mockRequest({ 'x-api-key': 'vx_valid' });
            const res = mockResponse();
            await apiKeyAuth(req, res, mockNext);
            expect(req.apiAuth).toBeDefined();
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('requireScope', () => {
        it('returns 401 when not authenticated', () => {
            const req = mockRequest({});
            const res = mockResponse();
            requireScope('read:agents')(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('returns 403 when scope missing', () => {
            const req = mockRequest({}, { scopes: ['read:logs'] });
            const res = mockResponse();
            requireScope('read:agents')(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('calls next when scope present', () => {
            const req = mockRequest({}, { scopes: ['read:agents'] });
            const res = mockResponse();
            requireScope('read:agents')(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('requireTier', () => {
        it('returns 403 when pro required but user is free', () => {
            const req = mockRequest({}, { tier: 'free' });
            const res = mockResponse();
            requireTier('pro')(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('calls next when tier matches', () => {
            const req = mockRequest({}, { tier: 'pro' });
            const res = mockResponse();
            requireTier('pro')(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('requirePollingInterval', () => {
        it('calls next for authenticated user', async () => {
            const req = mockRequest({ 'x-api-key': 'vx_test' }, { tier: 'pro' });
            const res = mockResponse();
            const handler = requirePollingInterval(60000);
            await handler(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        it('returns 401 when not authenticated', async () => {
            const req = mockRequest({});
            const res = mockResponse();
            const handler = requirePollingInterval(60000);
            await handler(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});
