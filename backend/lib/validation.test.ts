import { describe, it, expect } from 'vitest';
import {
  SolanaAddressSchema,
  UuidSchema,
  EmailSchema,
  TradeRequestSchema,
  WalletUpdateSchema,
  sanitizeHtml,
  sanitizeForLog,
  validateRequest,
} from './validation';

describe('SolanaAddressSchema', () => {
  it('accepts valid Solana addresses', () => {
    const validAddresses = [
      'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    ];
    validAddresses.forEach(addr => {
      expect(SolanaAddressSchema.safeParse(addr).success).toBe(true);
    });
  });

  it('rejects invalid addresses', () => {
    const invalidAddresses = ['', '0x123', 'invalid', 'a'.repeat(50)];
    invalidAddresses.forEach(addr => {
      expect(SolanaAddressSchema.safeParse(addr).success).toBe(false);
    });
  });
});

describe('EmailSchema', () => {
  it('accepts valid emails', () => {
    expect(EmailSchema.safeParse('test@example.com').success).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(EmailSchema.safeParse('invalid').success).toBe(false);
    expect(EmailSchema.safeParse('a'.repeat(300)).success).toBe(false);
  });
});

describe('TradeRequestSchema', () => {
  it('validates trade requests', () => {
    const valid = { action: 'buy', token: 'SOL', amount: 100, mode: 'paper' };
    expect(TradeRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid trade requests', () => {
    expect(TradeRequestSchema.safeParse({ action: 'invalid' }).success).toBe(false);
    expect(TradeRequestSchema.safeParse({ action: 'buy', amount: -1 }).success).toBe(false);
  });
});

describe('sanitizeHtml', () => {
  it('escapes HTML characters', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });
});

describe('sanitizeForLog', () => {
  it('removes newlines and truncates', () => {
    expect(sanitizeForLog('line1\nline2\rline3')).toBe('line1 line2 line3');
    expect(sanitizeForLog('a'.repeat(600)).length).toBe(500);
  });
});

describe('validateRequest', () => {
  it('returns validated data on success', () => {
    const result = validateRequest(WalletUpdateSchema, {
      walletAddress: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    });
    expect(result.success).toBe(true);
  });

  it('returns error message on failure', () => {
    const result = validateRequest(WalletUpdateSchema, { walletAddress: 'invalid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('walletAddress');
    }
  });
});
