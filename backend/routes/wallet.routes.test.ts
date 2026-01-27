import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/auth', () => ({
    getUserIdFromRequest: vi.fn()
}));

vi.mock('../lib/prisma', () => ({
    prisma: {
        agent: { findFirst: vi.fn() },
        user: { findUnique: vi.fn(), update: vi.fn() }
    }
}));

vi.mock('../services/solana', () => ({
    WalletManager: { generateWallet: vi.fn() }
}));

vi.mock('../services/secrets', () => ({
    decryptSecrets: vi.fn()
}));

vi.mock('../services/solana-balance', () => ({
    getWalletBalance: vi.fn(),
    withdrawFunds: vi.fn(),
    validateWalletAddress: vi.fn()
}));

vi.mock('../services/withdrawal-confirm.service', () => ({
    requestWithdrawal: vi.fn(),
    verifyWithdrawalToken: vi.fn()
}));

import { getUserIdFromRequest } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { WalletManager } from '../services/solana';
import { getWalletBalance, validateWalletAddress } from '../services/solana-balance';
import { requestWithdrawal, verifyWithdrawalToken } from '../services/withdrawal-confirm.service';

const mockRequest = (overrides = {}) => ({ params: {}, query: {}, body: {}, ...overrides });
const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('wallet.routes', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('GET /agents/:id/balance', () => {
        it('returns 401 when unauthorized', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue(null);
            const { default: router } = await import('./wallet.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id/balance')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { id: 'a1' } }), res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('returns balance for valid agent', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue({ walletAddress: 'wallet1' } as any);
            vi.mocked(getWalletBalance).mockResolvedValue({ lamports: 5500000000, sol: 5.5 });
            const { default: router } = await import('./wallet.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id/balance')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { id: 'a1' } }), res);
            expect(res.json).toHaveBeenCalledWith({ balance: { lamports: 5500000000, sol: 5.5 } });
        });
    });

    describe('POST /agents/:id/withdraw/request', () => {
        it('validates destination address', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'a1', user: {} } as any);
            vi.mocked(validateWalletAddress).mockResolvedValue(false);
            const { default: router } = await import('./wallet.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id/withdraw/request')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { id: 'a1' }, body: { destinationAddress: 'invalid' } }), res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('returns token on successful request', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'a1', user: { walletAddress: 'valid' } } as any);
            vi.mocked(validateWalletAddress).mockResolvedValue(true);
            vi.mocked(requestWithdrawal).mockResolvedValue({ token: 'abc123token', expiresAt: new Date() });
            const { default: router } = await import('./wallet.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id/withdraw/request')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ params: { id: 'a1' } }), res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('PUT /user/wallet', () => {
        it('validates wallet address', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(validateWalletAddress).mockResolvedValue(false);
            const { default: router } = await import('./wallet.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/user/wallet' && r.route.methods.put)?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ body: { walletAddress: 'bad' } }), res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('POST /generate-wallet', () => {
        it('generates new wallet', async () => {
            vi.mocked(WalletManager.generateWallet).mockReturnValue({ wallet: { address: 'addr' }, pluginConfig: {} } as any);
            const { default: router } = await import('./wallet.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/generate-wallet')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ body: {} }), res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
