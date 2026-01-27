import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as demoGenerator from './demo-generator';

describe('demo-generator', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('generateDemoClusters', () => {
    it('generates demo clusters with tokens', () => {
      const clusters = demoGenerator.generateDemoClusters();
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0]).toHaveProperty('id');
      expect(clusters[0]).toHaveProperty('name');
      expect(clusters[0]).toHaveProperty('tokens');
      expect(Array.isArray(clusters[0].tokens)).toBe(true);
    });

    it('generates clusters with heat scores', () => {
      const clusters = demoGenerator.generateDemoClusters();
      clusters.forEach(cluster => {
        expect(cluster).toHaveProperty('heatScore');
        expect(typeof cluster.heatScore).toBe('number');
      });
    });

    it('generates tokens with required properties', () => {
      const clusters = demoGenerator.generateDemoClusters();
      const firstToken = clusters[0]?.tokens[0];
      if (firstToken) {
        expect(firstToken).toHaveProperty('address');
        expect(firstToken).toHaveProperty('symbol');
        expect(firstToken).toHaveProperty('mentions');
        expect(firstToken).toHaveProperty('sentiment');
      }
    });
  });
});
