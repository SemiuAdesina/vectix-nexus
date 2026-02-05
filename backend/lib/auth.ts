import { verifyToken } from '@clerk/express';
import { prisma } from './prisma';

interface ClerkPayload {
  sub: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export async function getUserIdFromRequest(req: { headers: { [key: string]: string | string[] | undefined } }): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('CLERK_SECRET_KEY not set - auth will fail');
    return null;
  }

  try {
    const payload = await verifyToken(token, { secretKey }) as ClerkPayload;
    return payload.sub || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function ensureUserExists(userId: string, email?: string, name?: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: userId,
        email: email || `${userId}@clerk.user`,
        name: name || null,
      },
    });
  }
}

export async function getOrCreateUser(
  req: { headers: { [key: string]: string | string[] | undefined } }
): Promise<{ userId: string; user: { id: string; email: string; name: string | null } } | null> {
  const raw = req.headers.authorization ?? req.headers['Authorization'];
  const authHeader = Array.isArray(raw) ? raw[0] : raw;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Auth] 401: No Bearer token in Authorization header');
    }
    return null;
  }

  const token = authHeader.replace(/^\s*Bearer\s+/i, '').trim();
  if (!token) return null;

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('[Auth] 401: CLERK_SECRET_KEY is not set. Set it in backend .env from Clerk Dashboard → API Keys → Secret key.');
    return null;
  }

  try {
    const payload = await verifyToken(token, { secretKey }) as ClerkPayload;
    const userId = payload.sub;
    if (!userId) return null;

    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      const email = payload.email || `${userId}@clerk.user`;
      const name = payload.name || (payload.firstName && payload.lastName ? `${payload.firstName} ${payload.lastName}` : null);

      user = await prisma.user.create({
        data: { id: userId, email, name },
      });
    }

    return { userId, user };
  } catch (error) {
    console.error('[Auth] 401: Token verification failed.', error);
    return null;
  }
}
