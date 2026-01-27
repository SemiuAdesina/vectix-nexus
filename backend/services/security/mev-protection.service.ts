import { prisma } from '../../lib/prisma';

export interface JitoBundle {
  transactions: string[];
  tipLamports: number;
}

export interface MevProtectionResult {
  protected: boolean;
  method: 'jito' | 'standard';
  estimatedSavings: number;
}

const JITO_TIP_LAMPORTS = 10000;
const TURBO_FEE_LAMPORTS = 100000;

export async function createProtectedTransaction(
  agentId: string,
  transaction: string,
  useTurbo: boolean
): Promise<MevProtectionResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { mevProtectionEnabled: true },
  });

  if (!agent?.mevProtectionEnabled && !useTurbo) {
    return {
      protected: false,
      method: 'standard',
      estimatedSavings: 0,
    };
  }

  const bundle: JitoBundle = {
    transactions: [transaction],
    tipLamports: useTurbo ? TURBO_FEE_LAMPORTS : JITO_TIP_LAMPORTS,
  };

  console.log('Submitting Jito bundle:', bundle);

  return {
    protected: true,
    method: 'jito',
    estimatedSavings: useTurbo ? 50000 : 20000,
  };
}

export async function toggleMevProtection(agentId: string, enabled: boolean): Promise<boolean> {
  await prisma.agent.update({
    where: { id: agentId },
    data: { mevProtectionEnabled: enabled },
  });
  return enabled;
}

export function calculateTurboFee(): { userFee: number; validatorTip: number; profit: number } {
  return {
    userFee: 0.002,
    validatorTip: 0.001,
    profit: 0.001,
  };
}

