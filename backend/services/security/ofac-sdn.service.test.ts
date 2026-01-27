import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkOfacSdn,
  isCountrySanctioned,
  SANCTIONED_COUNTRY_CODES,
} from './ofac-sdn.service';

vi.mock('../../lib/prisma', () => ({
  prisma: { user: { update: vi.fn() } },
}));

vi.mock('../audit', () => ({
  logAuditEvent: vi.fn(),
  extractContext: vi.fn(() => ({})),
}));

describe('checkOfacSdn', () => {
  it('returns sanctioned for known OFAC address', async () => {
    const result = await checkOfacSdn('0x8589427373D6D84E98730D7795D8f6f8731FDA16');
    expect(result.isSanctioned).toBe(true);
    expect(result.matchType).toBe('exact');
    expect(result.source).toContain('OFAC');
  });

  it('returns not sanctioned for clean address', async () => {
    const result = await checkOfacSdn('0xCleanWalletAddress123456789');
    expect(result.isSanctioned).toBe(false);
    expect(result.matchType).toBe('none');
  });

  it('handles case-insensitive address matching', async () => {
    const result = await checkOfacSdn('0x8589427373d6d84e98730d7795d8f6f8731fda16');
    expect(result.isSanctioned).toBe(true);
  });

  it('includes timestamp in result', async () => {
    const result = await checkOfacSdn('someAddress');
    expect(result.checkedAt).toBeInstanceOf(Date);
  });
});

describe('isCountrySanctioned', () => {
  it('returns true for sanctioned countries', () => {
    expect(isCountrySanctioned('CU')).toBe(true);
    expect(isCountrySanctioned('IR')).toBe(true);
    expect(isCountrySanctioned('KP')).toBe(true);
    expect(isCountrySanctioned('SY')).toBe(true);
  });

  it('returns false for non-sanctioned countries', () => {
    expect(isCountrySanctioned('US')).toBe(false);
    expect(isCountrySanctioned('GB')).toBe(false);
    expect(isCountrySanctioned('DE')).toBe(false);
  });

  it('handles lowercase country codes', () => {
    expect(isCountrySanctioned('cu')).toBe(true);
    expect(isCountrySanctioned('us')).toBe(false);
  });
});

describe('SANCTIONED_COUNTRY_CODES', () => {
  it('contains expected sanctioned countries', () => {
    expect(SANCTIONED_COUNTRY_CODES.has('CU')).toBe(true);
    expect(SANCTIONED_COUNTRY_CODES.has('IR')).toBe(true);
    expect(SANCTIONED_COUNTRY_CODES.has('KP')).toBe(true);
    expect(SANCTIONED_COUNTRY_CODES.has('SY')).toBe(true);
  });
});
