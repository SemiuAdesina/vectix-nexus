import { prisma } from '../../lib/prisma';
import crypto from 'crypto';

const REFERRAL_COMMISSION_RATE = 0.20;

export interface AffiliateStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayouts: number;
}

export async function generateReferralCode(userId: string): Promise<string> {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (existingUser?.referralCode) {
    return existingUser.referralCode;
  }

  const code = crypto.randomBytes(4).toString('hex').toUpperCase();

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export async function applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });

  if (!referrer || referrer.id === userId) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { referredById: referrer.id },
  });

  return true;
}

export async function getAffiliateStats(userId: string): Promise<AffiliateStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      totalReferralEarnings: true,
      referrals: { select: { id: true } },
    },
  });

  if (!user) throw new Error('User not found');

  const pendingPayouts = await prisma.referralPayout.aggregate({
    where: { userId, status: 'pending' },
    _sum: { amount: true },
  });

  return {
    referralCode: user.referralCode || '',
    totalReferrals: user.referrals.length,
    totalEarnings: user.totalReferralEarnings,
    pendingPayouts: pendingPayouts._sum.amount || 0,
  };
}

export async function recordReferralEarning(
  referrerId: string,
  sourceUserId: string,
  tradingFee: number,
  txHash?: string
): Promise<void> {
  const commission = tradingFee * REFERRAL_COMMISSION_RATE;

  await prisma.referralPayout.create({
    data: {
      userId: referrerId,
      sourceUserId,
      amount: commission,
      sourceTxHash: txHash,
      status: 'pending',
    },
  });

  await prisma.user.update({
    where: { id: referrerId },
    data: { totalReferralEarnings: { increment: commission } },
  });
}

