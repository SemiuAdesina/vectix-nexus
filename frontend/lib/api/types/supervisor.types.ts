export type RuleType =
  | 'MAX_POSITION_SIZE'
  | 'MIN_LIQUIDITY'
  | 'MAX_DAILY_TRADES'
  | 'MAX_LOSS_PER_TRADE'
  | 'BLOCKED_TOKENS'
  | 'REQUIRED_MARKET_CAP'
  | 'MAX_PORTFOLIO_CONCENTRATION';

export interface SupervisorRule {
  id: string;
  type: RuleType;
  enabled: boolean;
  params: Record<string, number | string | string[]>;
  description: string;
}

export interface RuleViolation {
  ruleId: string;
  ruleType: RuleType;
  message: string;
  severity: 'warning' | 'block';
}

export interface SupervisorDecision {
  approved: boolean;
  violations: RuleViolation[];
  timestamp: string;
}
