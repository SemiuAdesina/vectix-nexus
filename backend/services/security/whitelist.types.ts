export interface WhitelistStatus {
  agentId: string;
  whitelistedWallet: string | null;
  isLocked: boolean;
  lockedUntil: Date | null;
  canWithdraw: boolean;
}

export interface WhitelistUpdateRequest {
  agentId: string;
  newWalletAddress: string;
}

export interface WhitelistUpdateResult {
  success: boolean;
  lockedUntil: Date;
  message: string;
}

export interface WithdrawalCheckResult {
  allowed: boolean;
  reason: string;
}

