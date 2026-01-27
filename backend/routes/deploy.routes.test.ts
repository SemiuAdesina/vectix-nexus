import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/auth', () => ({ getUserIdFromRequest: vi.fn() }));
vi.mock('../lib/subscription', () => ({ requireActiveSubscription: vi.fn() }));
vi.mock('../lib/prisma', () => ({ prisma: { agent: { create: vi.fn() } } }));
vi.mock('../services/fly', () => ({ createFlyMachine: vi.fn(), getMachineIP: vi.fn() }));
vi.mock('../services/solana', () => ({ WalletManager: { generateWallet: vi.fn() } }));
vi.mock('../../shared/schema', () => ({ validateCharacter: vi.fn() }));
vi.mock('../services/secrets', () => ({
    encryptSecrets: vi.fn(),
    secretsToEnvVars: vi.fn(),
    validateSecrets: vi.fn()
}));

import { getUserIdFromRequest } from '../lib/auth';
import { requireActiveSubscription } from '../lib/subscription';
import { prisma } from '../lib/prisma';
import { createFlyMachine, getMachineIP } from '../services/fly';
import { WalletManager } from '../services/solana';
import { validateCharacter } from '../../shared/schema';
import { validateSecrets } from '../services/secrets';

const mockRequest = (overrides = {}) => ({ params: {}, body: {}, ...overrides });
const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('deploy.routes', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('POST /deploy-agent', () => {
        it('returns 401 when unauthorized', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue(null);
            const { default: router } = await import('./deploy.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/deploy-agent')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({}), res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('returns 400 when characterJson missing', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(requireActiveSubscription).mockResolvedValue(undefined);
            const { default: router } = await import('./deploy.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/deploy-agent')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ body: {} }), res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('returns 400 for invalid character config', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(requireActiveSubscription).mockResolvedValue(undefined);
            vi.mocked(validateCharacter).mockReturnValue({ success: false, error: { message: 'Invalid' } } as any);
            const { default: router } = await import('./deploy.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/deploy-agent')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ body: { characterJson: '{}' } }), res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deploys agent successfully', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(requireActiveSubscription).mockResolvedValue(undefined);
            vi.mocked(validateCharacter).mockReturnValue({ success: true });
            vi.mocked(WalletManager.generateWallet).mockReturnValue({ wallet: { address: 'wallet1' } } as any);
            vi.mocked(createFlyMachine).mockResolvedValue({ id: 'machine1' } as any);
            vi.mocked(getMachineIP).mockResolvedValue('10.0.0.1');
            vi.mocked(prisma.agent.create).mockResolvedValue({ id: 'agent1' } as any);
            const { default: router } = await import('./deploy.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/deploy-agent')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ body: { characterJson: { name: 'TestAgent' } } }), res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, agentId: 'agent1' }));
        });

        it('returns 402 when subscription required', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('u1');
            vi.mocked(requireActiveSubscription).mockRejectedValue(new Error('subscription required'));
            const { default: router } = await import('./deploy.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/deploy-agent')?.route.stack[0].handle;
            const res = mockResponse();
            await handler(mockRequest({ body: { characterJson: '{}' } }), res);
            expect(res.status).toHaveBeenCalledWith(402);
        });
    });
});
