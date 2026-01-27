import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/auth', () => ({
    getUserIdFromRequest: vi.fn()
}));

vi.mock('../lib/prisma', () => ({
    prisma: {
        agent: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        }
    }
}));

vi.mock('../services/fly-lifecycle', () => ({
    startMachine: vi.fn(),
    stopMachine: vi.fn(),
    restartMachine: vi.fn(),
    getMachineStatus: vi.fn(),
    destroyMachine: vi.fn()
}));

vi.mock('../services/fly-logs', () => ({
    getMachineLogs: vi.fn()
}));

import { getUserIdFromRequest } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { startMachine, stopMachine, restartMachine, getMachineStatus, destroyMachine } from '../services/fly-lifecycle';
import { getMachineLogs } from '../services/fly-logs';

const mockRequest = (overrides = {}) => ({
    params: {},
    query: {},
    ...overrides
});

const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('agents.routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /agents', () => {
        it('returns 401 when unauthorized', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue(null);
            const req = mockRequest();
            const res = mockResponse();
            const { default: router } = await import('./agents.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents' && r.route.methods.get)?.route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('returns agents for authenticated user', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('user-123');
            vi.mocked(prisma.agent.findMany).mockResolvedValue([{ id: 'agent-1', name: 'Test' }] as any);
            const req = mockRequest();
            const res = mockResponse();
            const { default: router } = await import('./agents.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents' && r.route.methods.get)?.route.stack[0].handle;
            await handler(req, res);
            expect(res.json).toHaveBeenCalledWith({ agents: expect.any(Array) });
        });
    });

    describe('GET /agents/:id', () => {
        it('returns 404 when agent not found', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('user-123');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue(null);
            const req = mockRequest({ params: { id: 'invalid' } });
            const res = mockResponse();
            const { default: router } = await import('./agents.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id' && r.route.methods.get)?.route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('POST /agents/:id/start', () => {
        it('starts machine and updates status', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('user-123');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'agent-1', machineId: 'machine-1' } as any);
            vi.mocked(startMachine).mockResolvedValue(undefined);
            vi.mocked(prisma.agent.update).mockResolvedValue({} as any);
            const req = mockRequest({ params: { id: 'agent-1' } });
            const res = mockResponse();
            const { default: router } = await import('./agents.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id/start')?.route.stack[0].handle;
            await handler(req, res);
            expect(startMachine).toHaveBeenCalledWith('machine-1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 'running' });
        });
    });

    describe('POST /agents/:id/stop', () => {
        it('stops machine and updates status', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('user-123');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'agent-1', machineId: 'machine-1' } as any);
            vi.mocked(stopMachine).mockResolvedValue(undefined);
            vi.mocked(prisma.agent.update).mockResolvedValue({} as any);
            const req = mockRequest({ params: { id: 'agent-1' } });
            const res = mockResponse();
            const { default: router } = await import('./agents.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id/stop')?.route.stack[0].handle;
            await handler(req, res);
            expect(stopMachine).toHaveBeenCalledWith('machine-1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 'stopped' });
        });
    });

    describe('DELETE /agents/:id', () => {
        it('deletes agent and destroys machine', async () => {
            vi.mocked(getUserIdFromRequest).mockResolvedValue('user-123');
            vi.mocked(prisma.agent.findFirst).mockResolvedValue({ id: 'agent-1', machineId: 'machine-1' } as any);
            vi.mocked(destroyMachine).mockResolvedValue(undefined);
            vi.mocked(prisma.agent.delete).mockResolvedValue({} as any);
            const req = mockRequest({ params: { id: 'agent-1' } });
            const res = mockResponse();
            const { default: router } = await import('./agents.routes');
            const handler = (router as any).stack.find((r: any) => r.route?.path === '/agents/:id' && r.route.methods.delete)?.route.stack[0].handle;
            await handler(req, res);
            expect(destroyMachine).toHaveBeenCalledWith('machine-1');
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });
});
