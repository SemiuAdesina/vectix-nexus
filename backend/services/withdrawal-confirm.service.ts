import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';

const TOKEN_EXPIRY_MINUTES = 15;
const pendingWithdrawals = new Map<string, { token: string; expiresAt: number; agentId: string; destination: string; userId: string }>();

export function generateWithdrawalToken(): string {
    return randomBytes(32).toString('hex');
}

export async function requestWithdrawal(
    userId: string,
    agentId: string,
    destinationAddress: string
): Promise<{ token: string; expiresAt: Date }> {
    const token = generateWithdrawalToken();
    const expiresAt = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000;

    pendingWithdrawals.set(token, { token, expiresAt, agentId, destination: destinationAddress, userId });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
        console.log(`[WITHDRAWAL] Confirmation email would be sent to ${user.email} with token: ${token.slice(0, 8)}...`);
    }

    return { token, expiresAt: new Date(expiresAt) };
}

export function verifyWithdrawalToken(
    token: string,
    userId: string,
    agentId: string
): { valid: boolean; destination?: string; error?: string } {
    const pending = pendingWithdrawals.get(token);

    if (!pending) {
        return { valid: false, error: 'Invalid or expired confirmation token' };
    }

    if (pending.expiresAt < Date.now()) {
        pendingWithdrawals.delete(token);
        return { valid: false, error: 'Confirmation token expired' };
    }

    if (pending.userId !== userId || pending.agentId !== agentId) {
        return { valid: false, error: 'Token does not match this withdrawal request' };
    }

    pendingWithdrawals.delete(token);
    return { valid: true, destination: pending.destination };
}

export function cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of pendingWithdrawals.entries()) {
        if (data.expiresAt < now) pendingWithdrawals.delete(token);
    }
}

setInterval(cleanupExpiredTokens, 60000);
