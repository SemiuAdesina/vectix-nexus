import { describe, it, expect } from 'vitest';
import { calculateUptime } from './use-agents';

describe('use-agents', () => {
  describe('calculateUptime', () => {
    it('returns "Offline" when status is not running', () => {
      const createdAt = new Date(Date.now() - 3600000).toISOString();
      expect(calculateUptime(createdAt, 'stopped')).toBe('Offline');
      expect(calculateUptime(createdAt, 'error')).toBe('Offline');
    });

    it('returns "Just started" for very recent agents', () => {
      const createdAt = new Date(Date.now() - 1000).toISOString();
      expect(calculateUptime(createdAt, 'running')).toBe('Just started');
    });

    it('returns hours for agents running less than 24 hours', () => {
      const createdAt = new Date(Date.now() - 5 * 3600000).toISOString();
      const uptime = calculateUptime(createdAt, 'running');
      expect(uptime).toMatch(/^\d+h$/);
    });

    it('returns days and hours for agents running more than 24 hours', () => {
      const createdAt = new Date(Date.now() - 30 * 3600000).toISOString();
      const uptime = calculateUptime(createdAt, 'running');
      expect(uptime).toMatch(/^\d+d \d+h$/);
    });

    it('handles edge case of exactly 24 hours', () => {
      const createdAt = new Date(Date.now() - 24 * 3600000).toISOString();
      const uptime = calculateUptime(createdAt, 'running');
      expect(uptime).toMatch(/^\d+d \d+h$/);
    });
  });
});
