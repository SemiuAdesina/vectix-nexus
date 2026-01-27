import { describe, it, expect } from 'vitest';
import {
  formatVolume,
  formatPriceChange,
  formatLiquidity,
  formatMarketCap,
  shortenAddress,
} from './format';

describe('format', () => {
  describe('formatVolume', () => {
    it('formats millions', () => {
      expect(formatVolume(1_500_000)).toBe('$1.5M');
      expect(formatVolume(10_000_000)).toBe('$10.0M');
    });

    it('formats thousands', () => {
      expect(formatVolume(1_500)).toBe('$1.5K');
      expect(formatVolume(10_000)).toBe('$10.0K');
    });

    it('formats values less than 1000', () => {
      expect(formatVolume(500)).toBe('$500');
      expect(formatVolume(99)).toBe('$99');
    });

    it('handles zero', () => {
      expect(formatVolume(0)).toBe('$0');
    });

    it('handles values just below thresholds', () => {
      expect(formatVolume(999)).toBe('$999');
      expect(formatVolume(999_999)).toBe('$1000.0K');
    });
  });

  describe('formatPriceChange', () => {
    it('formats positive changes with + prefix', () => {
      expect(formatPriceChange(5.5)).toBe('+5.5%');
      expect(formatPriceChange(0.1)).toBe('+0.1%');
    });

    it('formats negative changes without + prefix', () => {
      expect(formatPriceChange(-5.5)).toBe('-5.5%');
      expect(formatPriceChange(-0.1)).toBe('-0.1%');
    });

    it('formats zero change', () => {
      expect(formatPriceChange(0)).toBe('+0.0%');
    });

    it('formats to one decimal place', () => {
      expect(formatPriceChange(5.5)).toBe('+5.5%');
      expect(formatPriceChange(-3.3)).toBe('-3.3%');
      expect(formatPriceChange(5.56)).toBe('+5.6%');
      expect(formatPriceChange(5.55)).toBe('+5.5%');
    });
  });

  describe('formatLiquidity', () => {
    it('formats millions', () => {
      expect(formatLiquidity(1_500_000)).toBe('$1.50M');
      expect(formatLiquidity(10_000_000)).toBe('$10.00M');
    });

    it('formats thousands', () => {
      expect(formatLiquidity(1_500)).toBe('$2K');
      expect(formatLiquidity(10_000)).toBe('$10K');
    });

    it('formats values less than 1000', () => {
      expect(formatLiquidity(500)).toBe('$500');
      expect(formatLiquidity(99)).toBe('$99');
    });

    it('handles zero', () => {
      expect(formatLiquidity(0)).toBe('$0');
    });
  });

  describe('formatMarketCap', () => {
    it('formats billions', () => {
      expect(formatMarketCap(1_500_000_000)).toBe('$1.50B');
      expect(formatMarketCap(10_000_000_000)).toBe('$10.00B');
    });

    it('formats millions', () => {
      expect(formatMarketCap(1_500_000)).toBe('$1.50M');
      expect(formatMarketCap(10_000_000)).toBe('$10.00M');
    });

    it('formats thousands', () => {
      expect(formatMarketCap(1_500)).toBe('$2K');
      expect(formatMarketCap(10_000)).toBe('$10K');
    });

    it('formats values less than 1000', () => {
      expect(formatMarketCap(500)).toBe('$500');
      expect(formatMarketCap(99)).toBe('$99');
    });

    it('handles zero', () => {
      expect(formatMarketCap(0)).toBe('$0');
    });

    it('handles values just below thresholds', () => {
      expect(formatMarketCap(999)).toBe('$999');
      expect(formatMarketCap(999_999)).toBe('$1000K');
      expect(formatMarketCap(1_000_000)).toBe('$1.00M');
      expect(formatMarketCap(999_999_999)).toBe('$1000.00M');
      expect(formatMarketCap(1_000_000_000)).toBe('$1.00B');
    });
  });

  describe('shortenAddress', () => {
    it('shortens address with default chars', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(shortenAddress(address)).toBe('0x12...5678');
    });

    it('shortens address with custom chars', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(shortenAddress(address, 6)).toBe('0x1234...345678');
    });

    it('handles short addresses', () => {
      const address = '0x1234';
      expect(shortenAddress(address)).toBe('0x12...1234');
    });

    it('handles very short addresses', () => {
      const address = '0x12';
      const result = shortenAddress(address, 1);
      expect(result).toContain('...');
      expect(result.length).toBeGreaterThan(address.length);
    });

    it('handles empty string', () => {
      expect(shortenAddress('')).toBe('...');
    });
  });
});
