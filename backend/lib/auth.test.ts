import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clerk/express', () => ({ verifyToken: vi.fn() }));
vi.mock('./prisma', () => ({
    prisma: {
        user: { findUnique: vi.fn(), create: vi.fn() }
    }
}));

import { verifyToken } from '@clerk/express';
import { prisma } from './prisma';
import { getUserIdFromRequest, ensureUserExists, getOrCreateUser } from './auth';

const mockRequest = (authHeader?: string) => ({
    headers: { authorization: authHeader }
});

describe('auth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    });

    describe('getUserIdFromRequest', () => {
        it('returns null when no authorization header', async () => {
            const result = await getUserIdFromRequest(mockRequest());
            expect(result).toBeNull();
        });

        it('returns null when header is not Bearer token', async () => {
            const result = await getUserIdFromRequest(mockRequest('Basic abc123'));
            expect(result).toBeNull();
        });

        it('returns userId on valid token', async () => {
            vi.mocked(verifyToken).mockResolvedValue({ sub: 'user-123' } as any);
            const result = await getUserIdFromRequest(mockRequest('Bearer valid-token'));
            expect(result).toBe('user-123');
        });

        it('returns null on token verification failure', async () => {
            vi.mocked(verifyToken).mockRejectedValue(new Error('Invalid token'));
            const result = await getUserIdFromRequest(mockRequest('Bearer bad-token'));
            expect(result).toBeNull();
        });
    });

    describe('ensureUserExists', () => {
        it('creates user if not exists', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.user.create).mockResolvedValue({} as any);
            await ensureUserExists('user-123', 'test@example.com', 'Test User');
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: { id: 'user-123', email: 'test@example.com', name: 'Test User' }
            });
        });

        it('does not create user if exists', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
            await ensureUserExists('user-123');
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    describe('getOrCreateUser', () => {
        it('returns null when unauthorized', async () => {
            const result = await getOrCreateUser(mockRequest());
            expect(result).toBeNull();
        });

        it('creates user if not exists and returns user data', async () => {
            vi.mocked(verifyToken).mockResolvedValue({ sub: 'user-123', email: 'test@example.com' } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.user.create).mockResolvedValue({ id: 'user-123', email: 'test@example.com', name: null } as any);
            const result = await getOrCreateUser(mockRequest('Bearer token'));
            expect(result).toEqual({
                userId: 'user-123',
                user: { id: 'user-123', email: 'test@example.com', name: null }
            });
        });

        it('returns existing user without creating', async () => {
            vi.mocked(verifyToken).mockResolvedValue({ sub: 'user-123' } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123', email: 'ex@test.com', name: 'Ex' } as any);
            const result = await getOrCreateUser(mockRequest('Bearer token'));
            expect(prisma.user.create).not.toHaveBeenCalled();
            expect(result?.userId).toBe('user-123');
        });
    });
});
