import { prisma } from '../../lib/prisma';

export interface SanctionCheckResult {
  address: string;
  isSanctioned: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  source: string;
}

const KNOWN_SANCTIONED_PREFIXES = [
  '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
  '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b',
];

export async function checkWalletSanctions(address: string): Promise<SanctionCheckResult> {
  const isSanctioned = KNOWN_SANCTIONED_PREFIXES.some(prefix =>
    address.toLowerCase().startsWith(prefix.toLowerCase())
  );

  if (isSanctioned) {
    return {
      address,
      isSanctioned: true,
      riskLevel: 'severe',
      source: 'OFAC Sanctions List',
    };
  }

  return {
    address,
    isSanctioned: false,
    riskLevel: 'low',
    source: 'Internal Check',
  };
}

export async function screenUserWallet(userId: string, walletAddress: string): Promise<{
  allowed: boolean;
  reason: string;
}> {
  const result = await checkWalletSanctions(walletAddress);

  if (result.isSanctioned) {
    await prisma.user.update({
      where: { id: userId },
      data: { sanctionStatus: 'blocked' },
    });

    return {
      allowed: false,
      reason: `Wallet flagged: ${result.source}. Account suspended.`,
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { sanctionStatus: 'clean' },
  });

  return { allowed: true, reason: 'Wallet cleared' };
}

