import { SecurityReport, TrustScore, RiskItem } from './security.types';

interface RiskCheck {
  id: string;
  label: string;
  severity: RiskItem['severity'];
  check: (r: SecurityReport) => boolean;
  passMsg: (r: SecurityReport) => string;
  failMsg: (r: SecurityReport) => string;
}

const RISK_CHECKS: RiskCheck[] = [
  {
    id: 'honeypot',
    label: 'Honeypot Check',
    severity: 'critical',
    check: (r) => !r.isHoneypot,
    passMsg: () => 'Token can be sold',
    failMsg: () => 'Cannot sell token (Honeypot detected)',
  },
  {
    id: 'mintable',
    label: 'Mint Authority',
    severity: 'critical',
    check: (r) => !r.isMintable,
    passMsg: () => 'Cannot mint new tokens',
    failMsg: () => 'Dev can mint unlimited tokens',
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    severity: 'high',
    check: (r) => r.liquidityUsd >= 50000,
    passMsg: (r) => `Liquidity: $${(r.liquidityUsd / 1000).toFixed(0)}k`,
    failMsg: (r) => `Low liquidity: $${r.liquidityUsd.toFixed(0)}`,
  },
  {
    id: 'lp_locked',
    label: 'Liquidity Locked',
    severity: 'high',
    check: (r) => r.liquidityLockedPercent >= 90,
    passMsg: (r) => `${r.liquidityLockedPercent.toFixed(0)}% LP locked`,
    failMsg: (r) => `Only ${r.liquidityLockedPercent.toFixed(0)}% LP locked`,
  },
  {
    id: 'renounced',
    label: 'Contract Ownership',
    severity: 'high',
    check: (r) => r.contractRenounced,
    passMsg: () => 'Contract ownership renounced',
    failMsg: () => 'Dev still owns contract',
  },
  {
    id: 'concentration',
    label: 'Holder Distribution',
    severity: 'medium',
    check: (r) => r.top10HoldersPercent <= 50,
    passMsg: (r) => `Top 10 hold ${r.top10HoldersPercent.toFixed(0)}%`,
    failMsg: (r) => `Top 10 hold ${r.top10HoldersPercent.toFixed(0)}% (concentrated)`,
  },
  {
    id: 'sell_tax',
    label: 'Sell Tax',
    severity: 'medium',
    check: (r) => r.sellTax <= 10,
    passMsg: (r) => `Sell tax: ${r.sellTax.toFixed(1)}%`,
    failMsg: (r) => `High sell tax: ${r.sellTax.toFixed(1)}%`,
  },
  {
    id: 'age',
    label: 'Token Age',
    severity: 'low',
    check: (r) => r.tokenAgeHours >= 24,
    passMsg: (r) => `Token age: ${Math.floor(r.tokenAgeHours / 24)}d`,
    failMsg: (r) => `New token: ${r.tokenAgeHours.toFixed(0)}h old`,
  },
];

const SEVERITY_WEIGHTS = { critical: 30, high: 20, medium: 10, low: 5 };

export function calculateTrustScore(report: SecurityReport): TrustScore {
  const risks: RiskItem[] = [];
  const passed: RiskItem[] = [];
  let deductions = 0;

  for (const check of RISK_CHECKS) {
    const isPassed = check.check(report);
    const message = isPassed ? check.passMsg(report) : check.failMsg(report);
    const item: RiskItem = {
      id: check.id,
      label: check.label,
      severity: check.severity,
      passed: isPassed,
      message,
    };

    if (isPassed) {
      passed.push(item);
    } else {
      risks.push(item);
      deductions += SEVERITY_WEIGHTS[check.severity];
    }
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  const grade = getGrade(score);

  return { score, grade, risks, passed };
}

function getGrade(score: number): TrustScore['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}
