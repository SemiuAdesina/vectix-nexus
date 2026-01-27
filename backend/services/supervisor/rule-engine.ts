import {
  SupervisorRule,
  TradeRequest,
  RuleViolation,
  SupervisorDecision,
  DEFAULT_RULES,
} from './supervisor.types';

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
        return this.checkMaxPosition(rule, req);
      case 'MIN_LIQUIDITY':
        return this.checkMinLiquidity(rule, req);
      case 'MAX_DAILY_TRADES':
        return this.checkMaxDailyTrades(rule, req);
      case 'MAX_LOSS_PER_TRADE':
        return this.checkMaxLoss(rule, req);
      case 'REQUIRED_MARKET_CAP':
        return this.checkMarketCap(rule, req);
      case 'MAX_PORTFOLIO_CONCENTRATION':
        return this.checkConcentration(rule, req);
      default:
        return null;
    }
  }

  private checkMaxPosition(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
    const maxPercent = rule.params.maxPercent as number;
    const positionPercent = (req.amountSol / req.portfolioValueSol) * 100;

    if (positionPercent > maxPercent) {
      return {
        ruleId: rule.id,
        ruleType: rule.type,
        message: `Position size ${positionPercent.toFixed(1)}% exceeds max ${maxPercent}%`,
        severity: 'block',
      };
    }
    return null;
  }

  private checkMinLiquidity(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
    const minUsd = rule.params.minUsd as number;
    if (req.tokenLiquidity < minUsd) {
      return {
        ruleId: rule.id,
        ruleType: rule.type,
        message: `Token liquidity $${req.tokenLiquidity.toLocaleString()} below minimum $${minUsd.toLocaleString()}`,
        severity: 'block',
      };
    }
    return null;
  }

  private checkMaxDailyTrades(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
    const maxTrades = rule.params.maxTrades as number;
    if (req.dailyTradeCount >= maxTrades) {
      return {
        ruleId: rule.id,
        ruleType: rule.type,
        message: `Daily trade limit (${maxTrades}) reached`,
        severity: 'block',
      };
    }
    return null;
  }

  private checkMaxLoss(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
    const maxLossPercent = rule.params.maxLossPercent as number;
    const potentialLossPercent = (req.amountSol / req.portfolioValueSol) * 100;

    if (potentialLossPercent > maxLossPercent) {
      return {
        ruleId: rule.id,
        ruleType: rule.type,
        message: `Potential loss ${potentialLossPercent.toFixed(1)}% exceeds max ${maxLossPercent}%`,
        severity: 'warning',
      };
    }
    return null;
  }

  private checkMarketCap(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
    const minUsd = rule.params.minUsd as number;
    if (req.tokenMarketCap < minUsd) {
      return {
        ruleId: rule.id,
        ruleType: rule.type,
        message: `Market cap $${req.tokenMarketCap.toLocaleString()} below minimum $${minUsd.toLocaleString()}`,
        severity: 'block',
      };
    }
    return null;
  }

  private checkConcentration(rule: SupervisorRule, _req: TradeRequest): RuleViolation | null {
    return null;
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

