const MAX_TRADE_AMOUNT_SOL = Number(process.env.MAX_TRADE_AMOUNT_SOL) || 50;
const MIN_TRADE_AMOUNT_SOL = 0.001;

export interface TradeLimitCheck {
  allowed: boolean;
  reason?: string;
}

export function checkTradeAmount(amountSol: number, mode: 'paper' | 'live'): TradeLimitCheck {
  if (typeof amountSol !== 'number' || amountSol <= 0) {
    return { allowed: false, reason: 'Amount must be a positive number' };
  }
  if (amountSol < MIN_TRADE_AMOUNT_SOL) {
    return { allowed: false, reason: `Minimum trade amount is ${MIN_TRADE_AMOUNT_SOL} SOL` };
  }
  if (mode === 'live' && amountSol > MAX_TRADE_AMOUNT_SOL) {
    return { allowed: false, reason: `Maximum live trade amount is ${MAX_TRADE_AMOUNT_SOL} SOL per trade` };
  }
  return { allowed: true };
}
