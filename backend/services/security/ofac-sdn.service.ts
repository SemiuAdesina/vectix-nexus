import { prisma } from '../../lib/prisma';
import { logAuditEvent, extractContext } from '../audit';
import { Request } from 'express';

export interface OfacCheckResult {
  address: string;
  isSanctioned: boolean;
  matchType: 'exact' | 'partial' | 'none';
  source: string;
  checkedAt: Date;
}

const OFAC_SDN_ADDRESSES = new Set([
  '0x8589427373D6D84E98730D7795D8f6f8731FDA16'.toLowerCase(),
  '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b'.toLowerCase(),
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B'.toLowerCase(),
  '0x1da5821544e25c636c1417Ba96Ade4Cf6D2f9B5A'.toLowerCase(),
  '0x7Db418b5D567A4e0E8c59Ad71BE1FcE48f3E6107'.toLowerCase(),
  'B23CZm8n5tDLv4KDq35WLmBmHrGn1nFpZLLHYCvKmjFv',
  'J8UaJpCR9LMhKn7RYwPqoQGhG8cLgHbJqm7vXzq5YdSA',
]);

const SANCTIONED_COUNTRY_CODES = new Set(['CU', 'IR', 'KP', 'SY', 'RU']);

export async function checkOfacSdn(address: string): Promise<OfacCheckResult> {
  const normalizedAddress = address.toLowerCase();
  const isSanctioned = OFAC_SDN_ADDRESSES.has(normalizedAddress);

  return {
    address,
    isSanctioned,
    matchType: isSanctioned ? 'exact' : 'none',
    source: 'OFAC SDN List (cached)',
    checkedAt: new Date(),
  };
}

export async function screenWalletWithAudit(
  userId: string,
  walletAddress: string,
  req?: Request
): Promise<{ allowed: boolean; reason: string }> {
  const result = await checkOfacSdn(walletAddress);
  const context = req ? extractContext(req) : { userId };

  await logAuditEvent(
    'security.sanctions_check',
    { ...context, userId },
    {
      walletAddress: walletAddress.slice(0, 8) + '***',
      result: result.isSanctioned ? 'BLOCKED' : 'CLEAR',
      source: result.source,
    },
    !result.isSanctioned
  );

  if (result.isSanctioned) {
    await prisma.user.update({
      where: { id: userId },
      data: { sanctionStatus: 'blocked' },
    });

    return {
      allowed: false,
      reason: `Wallet blocked: ${result.source}. Account suspended per OFAC regulations.`,
    };
  }

  return { allowed: true, reason: 'Wallet cleared' };
}

export function isCountrySanctioned(countryCode: string): boolean {
  return SANCTIONED_COUNTRY_CODES.has(countryCode.toUpperCase());
}

export { SANCTIONED_COUNTRY_CODES };
