import { z } from 'zod';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const UUID_REGEX = /^[a-zA-Z0-9_-]{21,36}$/;

export const SolanaAddressSchema = z.string()
  .min(32, 'Invalid Solana address length')
  .max(44, 'Invalid Solana address length')
  .regex(SOLANA_ADDRESS_REGEX, 'Invalid Solana address format');

export const UuidSchema = z.string()
  .min(21, 'Invalid ID length')
  .max(36, 'Invalid ID length')
  .regex(UUID_REGEX, 'Invalid ID format');

export const EmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long');

export const NameSchema = z.string()
  .min(1, 'Name required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Name contains invalid characters');

export const AgentNameSchema = z.string()
  .min(1, 'Agent name required')
  .max(50, 'Agent name too long')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Agent name contains invalid characters');

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  cursor: z.string().max(100).optional(),
});

export const WithdrawRequestSchema = z.object({
  destinationAddress: SolanaAddressSchema.optional(),
});

export const WithdrawConfirmSchema = z.object({
  token: z.string().min(32, 'Invalid token').max(128, 'Invalid token'),
});

export const TradeRequestSchema = z.object({
  action: z.enum(['buy', 'sell']),
  token: z.string().min(1).max(100),
  amount: z.number().positive().max(1e12),
  mode: z.enum(['paper', 'live']).default('paper'),
});

export const ApiKeyCreateSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9\s\-_]+$/),
  scopes: z.array(z.enum([
    'read:agents',
    'read:logs',
    'read:market',
    'write:control',
    'write:trade',
  ])).min(1).max(10),
});

export const WebhookSchema = z.object({
  url: z.string().url().max(2048).refine(
    (url: string) => url.startsWith('https://'),
    'Webhook URL must use HTTPS'
  ),
  events: z.array(z.string().max(50)).min(1).max(20),
});

export const StrategyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  priceUsd: z.number().int().min(0).max(10000).default(0),
  configJson: z.union([z.string().max(50000), z.record(z.string(), z.unknown())]),
  category: z.enum(['momentum', 'arbitrage', 'yield', 'social', 'custom']),
  icon: z.string().max(50).optional(),
});

export const WalletUpdateSchema = z.object({
  walletAddress: SolanaAddressSchema,
});

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeForLog(input: unknown): string {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return str.replace(/[\r\n]/g, ' ').substring(0, 500);
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues
    .map((e) => `${e.path.map(p => String(p)).join('.')}: ${e.message}`)
    .join(', ');
  return { success: false, error: errorMessage };
}
