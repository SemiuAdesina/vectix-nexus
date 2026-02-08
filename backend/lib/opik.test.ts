import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getOpik } from './opik';

describe('getOpik', () => {
  const orig = process.env.OPIK_API_KEY;

  afterEach(() => {
    process.env.OPIK_API_KEY = orig;
  });

  beforeEach(() => {
    delete process.env.OPIK_API_KEY;
  });

  it('returns null when OPIK_API_KEY is not set', async () => {
    const result = getOpik();
    expect(result).toBeNull();
  });

  it('returns client when OPIK_API_KEY is set', () => {
    process.env.OPIK_API_KEY = 'test-key';
    const result = getOpik();
    expect(result).not.toBeNull();
    expect(result?.trace).toBeDefined();
  });
});
