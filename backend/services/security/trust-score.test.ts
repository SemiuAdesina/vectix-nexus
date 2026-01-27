import { describe, it, expect } from 'vitest';
import * as trustScore from './trust-score';
import type { SecurityReport } from './security.types';

describe('trust-score', () => {
  describe('calculateTrustScore', () => {
    it('calculates high trust score for safe token', () => {
      const report: SecurityReport = {
        tokenAddress: 'token1',
        isHoneypot: false,
        isMintable: false,
        isFreezable: false,
        isBlacklisted: false,
        hasProxyContract: false,
        holderConcentration: 20,
        top10HoldersPercent: 20,
        liquidityLocked: true,
        liquidityLockedPercent: 95,
        liquidityUsd: 200000,
        contractRenounced: true,
        tokenAgeHours: 720,
        buyTax: 0,
        sellTax: 0,
        totalSupply: '1000000',
        circulatingSupply: '1000000',
        creatorAddress: '',
        creatorBalance: 0,
      };

      const result = trustScore.calculateTrustScore(report);
      expect(result.score).toBeGreaterThan(70);
      expect(result.grade).toMatch(/[A-B]/);
    });

    it('calculates low trust score for risky token', () => {
      const report: SecurityReport = {
        tokenAddress: 'token1',
        isHoneypot: true,
        isMintable: true,
        isFreezable: true,
        isBlacklisted: false,
        hasProxyContract: false,
        holderConcentration: 80,
        top10HoldersPercent: 80,
        liquidityLocked: false,
        liquidityLockedPercent: 10,
        liquidityUsd: 5000,
        contractRenounced: false,
        tokenAgeHours: 1,
        buyTax: 10,
        sellTax: 10,
        totalSupply: '1000000',
        circulatingSupply: '1000000',
        creatorAddress: '',
        creatorBalance: 0,
      };

      const result = trustScore.calculateTrustScore(report);
      expect(result.score).toBeLessThan(50);
      expect(result.grade).toMatch(/[D-F]/);
    });
  });
});
