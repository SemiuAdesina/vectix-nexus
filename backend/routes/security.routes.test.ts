import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/security/token-security', () => ({
    analyzeToken: vi.fn()
}));

import { analyzeToken } from '../services/security/token-security';

const mockRequest = (overrides = {}) => ({ params: {}, query: {}, body: {}, ...overrides });
const mockResponse = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('security.routes', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('GET /security/analyze/:tokenAddress', () => {
        it('returns 400 when token address missing', async () => {
            const { default: router } = await import('./security.routes');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/security/analyze/:tokenAddress')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { tokenAddress: '' } }), res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('returns analysis for valid token', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(analyzeToken).mockResolvedValue({ trustScore: { score: 85, grade: 'A' } } as any);
            const { default: router } = await import('./security.routes');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/security/analyze/:tokenAddress')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { tokenAddress: 'token123' } }), res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('returns 404 when analysis fails', async () => {
            vi.mocked(analyzeToken).mockResolvedValue(null);
            const { default: router } = await import('./security.routes');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/security/analyze/:tokenAddress')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { tokenAddress: 'bad' } }), res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
