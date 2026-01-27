import type { CharacterConfig } from './agent-creator.types';

interface StrategyConfig {
  strategy?: string;
  bio?: string[];
  adjectives?: string[];
  topics?: string[];
  systemPrompt?: string;
  system?: string;
  settings?: Record<string, unknown>;
  style?: Record<string, string[]>;
}

function ensureArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function mergeStrategyIntoConfig(
  baseConfig: CharacterConfig,
  strategyConfigJson: string
): CharacterConfig {
  const strategyConfig: StrategyConfig = JSON.parse(strategyConfigJson);

  const merged: CharacterConfig = { ...baseConfig };

  if (strategyConfig.bio && strategyConfig.bio.length > 0) {
    const baseBio = ensureArray(baseConfig.bio);
    merged.bio = [...baseBio, ...strategyConfig.bio];
  }

  if (strategyConfig.adjectives && strategyConfig.adjectives.length > 0) {
    merged.adjectives = [...(baseConfig.adjectives || []), ...strategyConfig.adjectives];
  }

  if (strategyConfig.topics && strategyConfig.topics.length > 0) {
    merged.topics = [...(baseConfig.topics || []), ...strategyConfig.topics];
  }

  if (strategyConfig.systemPrompt || strategyConfig.system) {
    merged.system = strategyConfig.systemPrompt || strategyConfig.system || merged.system;
  }

  if (strategyConfig.settings) {
    merged.settings = {
      ...baseConfig.settings,
      ...strategyConfig.settings,
      strategyId: strategyConfig.strategy,
    };
  }

  if (strategyConfig.style) {
    merged.style = {
      ...baseConfig.style,
      ...strategyConfig.style,
      all: [...(baseConfig.style?.all || []), ...(strategyConfig.style?.all || [])],
    };
  }

  return merged;
}
