import { describe, it, expect } from 'vitest';
import { DEFAULT_STRATEGIES } from './default-strategies';

describe('default-strategies', () => {
  it('exports an array of strategies', () => {
    expect(Array.isArray(DEFAULT_STRATEGIES)).toBe(true);
    expect(DEFAULT_STRATEGIES.length).toBeGreaterThan(0);
  });

  it('each strategy has required fields', () => {
    DEFAULT_STRATEGIES.forEach((strategy, index) => {
      expect(strategy.name, `Strategy ${index} missing name`).toBeDefined();
      expect(strategy.description, `Strategy ${index} missing description`).toBeDefined();
      expect(typeof strategy.priceUsd, `Strategy ${index} priceUsd should be number`).toBe('number');
      expect(strategy.category, `Strategy ${index} missing category`).toBeDefined();
      expect(strategy.icon, `Strategy ${index} missing icon`).toBeDefined();
      expect(typeof strategy.featured, `Strategy ${index} featured should be boolean`).toBe('boolean');
      expect(typeof strategy.verified, `Strategy ${index} verified should be boolean`).toBe('boolean');
      expect(strategy.configJson, `Strategy ${index} missing configJson`).toBeDefined();
    });
  });

  it('configJson is valid JSON for all strategies', () => {
    DEFAULT_STRATEGIES.forEach((strategy, index) => {
      expect(() => {
        const config = JSON.parse(strategy.configJson);
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
      }, `Strategy ${index} has invalid configJson`).not.toThrow();
    });
  });

  it('configJson contains required fields', () => {
    DEFAULT_STRATEGIES.forEach((strategy, index) => {
      const config = JSON.parse(strategy.configJson);
      expect(config.strategy, `Strategy ${index} config missing strategy field`).toBeDefined();
      expect(Array.isArray(config.bio) || typeof config.bio === 'string', `Strategy ${index} bio should be array or string`).toBe(true);
      expect(Array.isArray(config.adjectives), `Strategy ${index} adjectives should be array`).toBe(true);
      expect(Array.isArray(config.topics), `Strategy ${index} topics should be array`).toBe(true);
      expect(config.systemPrompt || config.system, `Strategy ${index} missing systemPrompt or system`).toBeDefined();
      expect(config.settings, `Strategy ${index} missing settings`).toBeDefined();
      expect(typeof config.settings).toBe('object');
    });
  });

  it('has at least one featured strategy', () => {
    const featured = DEFAULT_STRATEGIES.filter((s) => s.featured);
    expect(featured.length).toBeGreaterThan(0);
  });

  it('has at least one free strategy (priceUsd = 0)', () => {
    const free = DEFAULT_STRATEGIES.filter((s) => s.priceUsd === 0);
    expect(free.length).toBeGreaterThan(0);
  });

  it('all strategies are verified', () => {
    DEFAULT_STRATEGIES.forEach((strategy) => {
      expect(strategy.verified).toBe(true);
    });
  });

  it('categories are valid', () => {
    const validCategories = ['meme', 'defi', 'trading', 'social'];
    DEFAULT_STRATEGIES.forEach((strategy) => {
      expect(validCategories.includes(strategy.category), `Invalid category: ${strategy.category}`).toBe(true);
    });
  });

  it('priceUsd is non-negative', () => {
    DEFAULT_STRATEGIES.forEach((strategy) => {
      expect(strategy.priceUsd).toBeGreaterThanOrEqual(0);
    });
  });

  it('has unique strategy names', () => {
    const names = DEFAULT_STRATEGIES.map((s) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('has unique strategy IDs in configJson', () => {
    const strategyIds = DEFAULT_STRATEGIES.map((s) => {
      const config = JSON.parse(s.configJson);
      return config.strategy;
    });
    const uniqueIds = new Set(strategyIds);
    expect(uniqueIds.size).toBe(strategyIds.length);
  });

  describe('specific strategies', () => {
    it('has Solana Meme Sniper strategy', () => {
      const strategy = DEFAULT_STRATEGIES.find((s) => s.name === 'Solana Meme Sniper');
      expect(strategy).toBeDefined();
      expect(strategy?.category).toBe('meme');
      expect(strategy?.featured).toBe(true);
      expect(strategy?.priceUsd).toBe(4900);
    });

    it('has Stablecoin Yield Farmer strategy', () => {
      const strategy = DEFAULT_STRATEGIES.find((s) => s.name === 'Stablecoin Yield Farmer');
      expect(strategy).toBeDefined();
      expect(strategy?.category).toBe('defi');
      expect(strategy?.featured).toBe(true);
    });

    it('has Copy Trader Basic as free strategy', () => {
      const strategy = DEFAULT_STRATEGIES.find((s) => s.name === 'Copy Trader Basic');
      expect(strategy).toBeDefined();
      expect(strategy?.priceUsd).toBe(0);
    });
  });
});
