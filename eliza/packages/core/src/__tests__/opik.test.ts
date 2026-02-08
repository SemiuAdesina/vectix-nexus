import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getOpikClient, resetOpikClientForTesting } from '../opik';

describe('getOpikClient', () => {
  const orig = process.env.OPIK_API_KEY;

  afterEach(() => {
    process.env.OPIK_API_KEY = orig;
    resetOpikClientForTesting();
  });

  beforeEach(() => {
    delete process.env.OPIK_API_KEY;
    resetOpikClientForTesting();
  });

  it('returns null when OPIK_API_KEY is not set', async () => {
    const result = await getOpikClient();
    expect(result).toBeNull();
  });

  it('returns client or null when OPIK_API_KEY is set (client when opik is installed)', async () => {
    process.env.OPIK_API_KEY = 'test-key';
    const result = await getOpikClient();
    if (result !== null) {
      expect(result.trace).toBeDefined();
      expect(typeof result.trace).toBe('function');
    }
  });
});
