import { prisma } from '../../lib/prisma';
import { RuleEngine } from './rule-engine';
import { DEFAULT_RULES, type SupervisorRule } from './supervisor.types';

const CACHE_TTL_MS = 30_000;
const DEFAULT_RULE_CHANGE_DELAY_MS = 60 * 60 * 1000;

let rulesCache: SupervisorRule[] | null = null;
let cacheExpiry = 0;

export function clearRulesCache(): void {
  rulesCache = null;
  cacheExpiry = 0;
}

function getRuleChangeDelayMs(): number {
  const v = process.env.RULE_CHANGE_DELAY_MS;
  const n = v ? parseInt(v, 10) : DEFAULT_RULE_CHANGE_DELAY_MS;
  return Number.isFinite(n) ? n : DEFAULT_RULE_CHANGE_DELAY_MS;
}

async function seedIfEmpty(): Promise<void> {
  const count = await prisma.supervisorRuleVersion.count();
  if (count > 0) return;

  const now = new Date();
  await prisma.supervisorRuleVersion.createMany({
    data: DEFAULT_RULES.map(r => ({
      ruleId: r.id,
      type: r.type,
      params: r.params as object,
      enabled: r.enabled,
      description: r.description,
      effectiveAt: now,
    })),
  });
}

export async function getEffectiveRules(): Promise<SupervisorRule[]> {
  const now = Date.now();
  if (rulesCache && cacheExpiry > now) return rulesCache;

  await seedIfEmpty();

  const versions = await prisma.supervisorRuleVersion.findMany({
    orderBy: { effectiveAt: 'desc' },
  });

  const effective = new Map<string, SupervisorRule>();
  const cutoff = new Date();

  for (const v of versions) {
    if (v.effectiveAt > cutoff) continue;
    if (effective.has(v.ruleId)) continue;

    effective.set(v.ruleId, {
      id: v.ruleId,
      type: v.type as SupervisorRule['type'],
      enabled: v.enabled,
      params: v.params as SupervisorRule['params'],
      description: v.description,
    });
  }

  const result = Array.from(effective.values());
  if (result.length === 0) return [...DEFAULT_RULES];

  rulesCache = result;
  cacheExpiry = now + CACHE_TTL_MS;
  return result;
}

export async function updateRule(
  ruleId: string,
  updates: Partial<Pick<SupervisorRule, 'enabled' | 'params' | 'description'>>
): Promise<{ effectiveAt: Date }> {
  const rules = await getEffectiveRules();
  const current = rules.find(r => r.id === ruleId);
  if (!current) throw new Error(`Rule not found: ${ruleId}`);

  const effectiveAt = new Date(Date.now() + getRuleChangeDelayMs());
  await prisma.supervisorRuleVersion.create({
    data: {
      ruleId,
      type: current.type,
      params: (updates.params ?? current.params) as object,
      enabled: updates.enabled ?? current.enabled,
      description: updates.description ?? current.description,
      effectiveAt,
    },
  });

  rulesCache = null;
  return { effectiveAt };
}

export async function evaluateWithDbRules(
  request: Parameters<RuleEngine['evaluate']>[0]
) {
  const rules = await getEffectiveRules();
  const engine = new RuleEngine(rules);
  return engine.evaluate(request);
}
