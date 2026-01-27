export interface RiskFlag {
  type: 'HIGH_SLIPPAGE' | 'DRAINER_DETECTED' | 'UNKNOWN_PROGRAM' | 'EXCESSIVE_LOSS';
  severity: 'warning' | 'critical';
  message: string;
}

export interface PreflightStats {
  total: number;
  approved: number;
  blocked: number;
  blockedReasons: string[];
}

export interface PreflightDecision {
  approved: boolean;
  action: string;
  reason: string;
  timestamp: string;
  riskFlags: RiskFlag[];
}
