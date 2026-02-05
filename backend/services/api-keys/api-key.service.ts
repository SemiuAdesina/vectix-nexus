import { randomBytes, pbkdf2Sync, createHash } from 'crypto';
import { prisma } from '../../lib/prisma';
import { ApiScope, ApiTier, ApiKeyData, CreateApiKeyResponse, FREE_TIER_SCOPES, PRO_TIER_SCOPES } from './api-key.types';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const HASH_SALT = process.env.API_KEY_HASH_SALT || 'vectix-nexus-api-key-v1';

function generateApiKey(): string {
  const randomPart = randomBytes(24).toString('base64url');
  return `vx_${randomPart}`;
}

function hashKey(key: string): string {
  return pbkdf2Sync(key, HASH_SALT, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, 'sha256').toString('hex');
}

function legacyHashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function getKeyPrefix(key: string): string {
  return key.substring(0, 10) + '...' + key.substring(key.length - 6);
}

export async function createApiKey(userId: string, name: string, scopes: ApiScope[]): Promise<CreateApiKeyResponse> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  });
  
  const tier: ApiTier = subscription ? 'pro' : 'free';
  const allowedScopes = tier === 'pro' ? PRO_TIER_SCOPES : FREE_TIER_SCOPES;
  const validScopes = scopes.filter(s => allowedScopes.includes(s));
  
  const key = generateApiKey();
  const keyHash = hashKey(key);
  const keyPrefix = getKeyPrefix(key);
  
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix,
      scopes: JSON.stringify(validScopes),
      tier,
    },
  });
  
  return {
    key,
    data: formatApiKey(apiKey),
  };
}

export async function listApiKeys(userId: string): Promise<ApiKeyData[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  return keys.map(formatApiKey);
}

export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: { id: keyId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count > 0;
}

export async function validateApiKey(key: string): Promise<{ userId: string; scopes: ApiScope[]; tier: ApiTier } | null> {
  const keyHash = hashKey(key);
  let apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) {
    apiKey = await prisma.apiKey.findUnique({ where: { keyHash: legacyHashKey(key) } });
  }
  if (!apiKey || apiKey.revokedAt || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
    return null;
  }
  
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
  });
  
  return {
    userId: apiKey.userId,
    scopes: JSON.parse(apiKey.scopes) as ApiScope[],
    tier: apiKey.tier as ApiTier,
  };
}

function formatApiKey(key: { id: string; name: string; keyPrefix: string; scopes: string; tier: string; requestCount: number; lastUsedAt: Date | null; createdAt: Date }): ApiKeyData {
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    scopes: JSON.parse(key.scopes),
    tier: key.tier as ApiTier,
    requestCount: key.requestCount,
    lastUsedAt: key.lastUsedAt?.toISOString() || null,
    createdAt: key.createdAt.toISOString(),
  };
}

