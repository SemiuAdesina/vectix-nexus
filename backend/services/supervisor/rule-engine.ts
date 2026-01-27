import {
  SupervisorRule,
  TradeRequest,
  RuleViolation,
  SupervisorDecision,
  DEFAULT_RULES,
} from './supervisor.types';
import {
  checkMaxPosition,
  checkMinLiquidity,
  checkMaxDailyTrades,
  checkMaxLoss,
  checkMarketCap,
  checkConcentration,
  checkTrustScore,
} from './rule-checkers';

export class RuleEngine {
  private rules: Map<string, SupervisorRule> = new Map();

  constructor(customRules?: SupervisorRule[]) {
    const rules = customRules || DEFAULT_RULES;
    rules.forEach(rule => this.rules.set(rule.id, rule));
  }

  evaluate(request: TradeRequest): SupervisorDecision {
    const violations: RuleViolation[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      const violation = this.checkRule(rule, request);
      if (violation) violations.push(violation);
    }

    return {
      approved: !violations.some(v => v.severity === 'block'),
      violations,
      timestamp: new Date(),
      request,
    };
  }

  private checkRule(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
    switch (rule.type) {
      case 'MAX_POSITION_SIZE':
        return checkMaxPosition(rule, req);
      case 'MIN_LIQUIDITY':
        return checkMinLiquidity(rule, req);
      case 'MAX_DAILY_TRADES':
        return checkMaxDailyTrades(rule, req);
      case 'MAX_LOSS_PER_TRADE':
        return checkMaxLoss(rule, req);
      case 'REQUIRED_MARKET_CAP':
        return checkMarketCap(rule, req);
      case 'MAX_PORTFOLIO_CONCENTRATION':
        return checkConcentration(rule, req);
      case 'MIN_TRUST_SCORE':
        return checkTrustScore(rule, req);
      default:
        return null;
    }
  }

  updateRule(ruleId: string, updates: Partial<SupervisorRule>): void {
    const existing = this.rules.get(ruleId);
    if (existing) {
      this.rules.set(ruleId, { ...existing, ...updates });
    }
  }

  getRules(): SupervisorRule[] {
    return Array.from(this.rules.values());
  }
}

