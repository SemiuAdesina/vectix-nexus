import { prisma } from '../../lib/prisma';
import { WhitelistStatus, WhitelistUpdateResult, WithdrawalCheckResult } from './whitelist.types';

const LOCK_DURATION_HOURS = 24;

export async function getWhitelistStatus(agentId: string): Promise<WhitelistStatus | null> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      whitelistedWallet: true,
      whitelistLockedUntil: true,
    },
  });

  if (!agent) return null;

  const now = new Date();
  const isLocked = agent.whitelistLockedUntil ? now < agent.whitelistLockedUntil : false;

  return {
    agentId: agent.id,
    whitelistedWallet: agent.whitelistedWallet,
    isLocked,
    lockedUntil: agent.whitelistLockedUntil,
    canWithdraw: !isLocked && !!agent.whitelistedWallet,
  };
}

export async function setWhitelistedWallet(
  agentId: string,
  newWalletAddress: string
): Promise<WhitelistUpdateResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { whitelistedWallet: true, whitelistLockedUntil: true },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  const now = new Date();
  if (agent.whitelistLockedUntil && now < agent.whitelistLockedUntil) {
    throw new Error(`Wallet change locked until ${agent.whitelistLockedUntil.toISOString()}`);
  }

  const lockedUntil = new Date(now.getTime() + LOCK_DURATION_HOURS * 60 * 60 * 1000);

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      whitelistedWallet: newWalletAddress,
      whitelistLockedUntil: lockedUntil,
    },
  });

  return {
    success: true,
    lockedUntil,
    message: `Wallet updated. Withdrawals locked for ${LOCK_DURATION_HOURS} hours.`,
  };
}

export async function checkWithdrawalAllowed(
  agentId: string,
  destinationWallet: string
): Promise<WithdrawalCheckResult> {
  const status = await getWhitelistStatus(agentId);

  if (!status) {
    return { allowed: false, reason: 'Agent not found' };
  }

  if (!status.whitelistedWallet) {
    return { allowed: false, reason: 'No whitelisted wallet configured' };
  }

  if (status.isLocked) {
    return { allowed: false, reason: `Wallet locked until ${status.lockedUntil?.toISOString()}` };
  }

  if (status.whitelistedWallet !== destinationWallet) {
    return { allowed: false, reason: 'Destination does not match whitelisted wallet' };
  }

  return { allowed: true, reason: 'Withdrawal approved' };
}

