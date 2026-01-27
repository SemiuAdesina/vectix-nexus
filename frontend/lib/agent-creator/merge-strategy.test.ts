import { describe, it, expect } from 'vitest';
import { mergeStrategyIntoConfig } from './merge-strategy';
import type { CharacterConfig } from './agent-creator.types';

describe('merge-strategy', () => {
  const baseConfig: CharacterConfig = {
    name: 'Test Agent',
    bio: 'Base bio',
    system: 'Base system prompt',
    adjectives: ['smart'],
    topics: ['crypto'],
    settings: { baseSetting: 'value' },
    style: {
      all: ['base-style'],
      chat: ['chat-style'],
    },
  };

  it('merges bio arrays', () => {
    const strategyJson = JSON.stringify({
      bio: ['Strategy bio 1', 'Strategy bio 2'],
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.bio).toEqual(['Base bio', 'Strategy bio 1', 'Strategy bio 2']);
  });

  it('handles string bio in base config', () => {
    const strategyJson = JSON.stringify({
      bio: ['Strategy bio'],
    });
    const result = mergeStrategyIntoConfig({ ...baseConfig, bio: 'String bio' }, strategyJson);
    expect(result.bio).toEqual(['String bio', 'Strategy bio']);
  });

  it('merges adjectives arrays', () => {
    const strategyJson = JSON.stringify({
      adjectives: ['aggressive', 'bold'],
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.adjectives).toEqual(['smart', 'aggressive', 'bold']);
  });

  it('handles missing adjectives in base config', () => {
    const strategyJson = JSON.stringify({
      adjectives: ['new-adjective'],
    });
    const result = mergeStrategyIntoConfig({ ...baseConfig, adjectives: undefined }, strategyJson);
    expect(result.adjectives).toEqual(['new-adjective']);
  });

  it('merges topics arrays', () => {
    const strategyJson = JSON.stringify({
      topics: ['defi', 'nft'],
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.topics).toEqual(['crypto', 'defi', 'nft']);
  });

  it('replaces system prompt with systemPrompt from strategy', () => {
    const strategyJson = JSON.stringify({
      systemPrompt: 'New system prompt',
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.system).toBe('New system prompt');
  });

  it('replaces system prompt with system from strategy', () => {
    const strategyJson = JSON.stringify({
      system: 'New system',
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.system).toBe('New system');
  });

  it('prefers systemPrompt over system', () => {
    const strategyJson = JSON.stringify({
      systemPrompt: 'Preferred prompt',
      system: 'Other system',
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.system).toBe('Preferred prompt');
  });

  it('merges settings and adds strategyId', () => {
    const strategyJson = JSON.stringify({
      strategy: 'strategy-123',
      settings: { newSetting: 'newValue' },
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.settings).toEqual({
      baseSetting: 'value',
      newSetting: 'newValue',
      strategyId: 'strategy-123',
    });
  });

  it('merges style objects', () => {
    const strategyJson = JSON.stringify({
      style: {
        all: ['strategy-style'],
        post: ['post-style'],
      },
    });
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result.style?.all).toEqual(['base-style', 'strategy-style']);
    expect(result.style?.chat).toEqual(['chat-style']);
    expect(result.style?.post).toEqual(['post-style']);
  });

  it('handles empty strategy config', () => {
    const strategyJson = JSON.stringify({});
    const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(result).toEqual(baseConfig);
  });

    it('handles strategy with only strategy field', () => {
      const strategyJson = JSON.stringify({
        strategy: 'strategy-456',
        settings: {},
      });
      const result = mergeStrategyIntoConfig(baseConfig, strategyJson);
      expect(result.settings?.strategyId).toBe('strategy-456');
    });

  it('does not modify base config', () => {
    const strategyJson = JSON.stringify({
      bio: ['New bio'],
    });
    const originalBio = baseConfig.bio;
    mergeStrategyIntoConfig(baseConfig, strategyJson);
    expect(baseConfig.bio).toBe(originalBio);
  });
});
