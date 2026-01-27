import { describe, it, expect } from 'vitest';
import { generateSignal } from './signal-generator';
import type { NarrativeCluster } from './narrative.types';

describe('Signal Generator', () => {
  const createCluster = (overrides: Partial<NarrativeCluster> = {}): NarrativeCluster => ({
    id: 'test-cluster',
    name: 'Test Cluster',
    keywords: ['test'],
    tokens: [],
    mentionCount: 0,
    growthRate: 0,
    sentiment: 0,
    heatScore: 0,
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('generates HEATING_UP signal for positive growth', () => {
    const cluster = createCluster({ growthRate: 25 });
    const signal = generateSignal(cluster);

    expect(signal.signalType).toBe('HEATING_UP');
    expect(signal.clusterId).toBe(cluster.id);
    expect(signal.strength).toBeGreaterThan(0);
  });

  it('generates COOLING_DOWN signal for negative growth', () => {
    const cluster = createCluster({ growthRate: -25 });
    const signal = generateSignal(cluster);

    expect(signal.signalType).toBe('COOLING_DOWN');
    expect(signal.clusterId).toBe(cluster.id);
  });

  it('includes top tokens in signal', () => {
    const cluster = createCluster({
      tokens: [
        { address: 'token1', symbol: 'T1', name: 'Token 1', mentions: 100, sentiment: 50, priceChange24h: 10, socialScore: 70 },
        { address: 'token2', symbol: 'T2', name: 'Token 2', mentions: 80, sentiment: 60, priceChange24h: 15, socialScore: 75 },
      ],
    });

    const signal = generateSignal(cluster);
    expect(signal.topTokens.length).toBeLessThanOrEqual(3);
  });

  it('caps strength at 100', () => {
    const cluster = createCluster({ growthRate: 150 });
    const signal = generateSignal(cluster);
    expect(signal.strength).toBeLessThanOrEqual(100);
  });
});
