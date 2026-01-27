import { SupervisorRule, TradeRequest, RuleViolation } from './supervisor.types';

export function checkMaxPosition(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
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

export function checkMinLiquidity(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
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

export function checkMaxDailyTrades(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
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

export function checkMaxLoss(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
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

export function checkMarketCap(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
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

export function checkConcentration(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
  const maxPercent = rule.params.maxPercent as number;
  if (!req.currentHoldings) return null;
  
  const tokenHolding = req.currentHoldings.get(req.tokenAddress) || 0;
  const newPositionPercent = ((tokenHolding + req.amountSol) / req.portfolioValueSol) * 100;
  
  if (newPositionPercent > maxPercent) {
    return {
      ruleId: rule.id,
      ruleType: rule.type,
      message: `Portfolio concentration ${newPositionPercent.toFixed(1)}% exceeds max ${maxPercent}%`,
      severity: 'block',
    };
  }
  return null;
}

export function checkTrustScore(rule: SupervisorRule, req: TradeRequest): RuleViolation | null {
  const minScore = rule.params.minScore as number;
  if (req.trustScore === undefined || req.trustScore === null) {
    return {
      ruleId: rule.id,
      ruleType: rule.type,
      message: 'Trust score not available - cannot verify token safety',
      severity: 'block',
    };
  }
  
  if (req.trustScore < minScore) {
    return {
      ruleId: rule.id,
      ruleType: rule.type,
      message: `Trust score ${req.trustScore} below minimum ${minScore}`,
      severity: 'block',
    };
  }
  return null;
}
