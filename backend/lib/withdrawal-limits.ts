const MAX_WITHDRAWAL_PER_DAY_SOL = Number(process.env.MAX_WITHDRAWAL_PER_DAY_SOL) || 100;
const MAX_WITHDRAWAL_PER_TX_SOL = Number(process.env.MAX_WITHDRAWAL_PER_TX_SOL) || 50;

export interface WithdrawalLimitCheck {
  allowed: boolean;
  reason?: string;
}

export function checkWithdrawalAmount(amountSol: number): WithdrawalLimitCheck {
  if (typeof amountSol !== 'number' || amountSol <= 0) {
    return { allowed: false, reason: 'Withdrawal amount must be positive' };
  }
  if (amountSol > MAX_WITHDRAWAL_PER_TX_SOL) {
    return { allowed: false, reason: `Maximum withdrawal per transaction is ${MAX_WITHDRAWAL_PER_TX_SOL} SOL` };
  }
  return { allowed: true };
}

export { MAX_WITHDRAWAL_PER_DAY_SOL, MAX_WITHDRAWAL_PER_TX_SOL };
