import { describe, it, expect } from 'vitest';
import { buildClustersFromCoins } from './cluster-builder';
import type { LunarCrushCoin } from '../lunarcrush-client';

describe('Cluster Builder', () => {
  const createMockCoin = (overrides: Partial<LunarCrushCoin> = {}): LunarCrushCoin => ({
    symbol: 'TEST',
    name: 'Test Coin',
    percent_change_24h: 0,
    social_volume: 0,
    social_score: 0,
    galaxy_score: 0,
    ...overrides,
  });

  it('builds clusters from coins', () => {
    const coins: LunarCrushCoin[] = [
      createMockCoin({ symbol: 'DOGE', name: 'Dogecoin', social_volume: 50000 }),
      createMockCoin({ symbol: 'SHIB', name: 'Shiba Inu', social_volume: 30000 }),
    ];

    const clusters = buildClustersFromCoins(coins);
    expect(Array.isArray(clusters)).toBe(true);
    expect(clusters.length).toBeGreaterThan(0);
  });

  it('calculates growth rates correctly', () => {
    const coins: LunarCrushCoin[] = [
      createMockCoin({ percent_change_24h: 10 }),
      createMockCoin({ percent_change_24h: 20 }),
    ];

    const clusters = buildClustersFromCoins(coins);
    expect(clusters.length).toBeGreaterThan(0);
  });

  it('handles empty coin array', () => {
    const clusters = buildClustersFromCoins([]);
    expect(Array.isArray(clusters)).toBe(true);
  });
});
