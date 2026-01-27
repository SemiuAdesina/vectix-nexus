import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getVoterId } from './voter-id';

describe('voter-id', () => {
  const originalLocalStorage = global.localStorage;
  const originalWindow = global.window;

  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;
    global.window = { ...originalWindow } as Window & typeof globalThis;
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('generates and stores new voter ID when none exists', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const voterId = getVoterId();
    expect(voterId).toMatch(/^voter_\d+_[a-z0-9]+$/);
    expect(localStorage.setItem).toHaveBeenCalledWith('governance_voter_id', voterId);
  });

  it('returns existing voter ID from localStorage', () => {
    const existingId = 'voter_1234567890_abc123';
    vi.mocked(localStorage.getItem).mockReturnValue(existingId);
    const voterId = getVoterId();
    expect(voterId).toBe(existingId);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('generates unique voter IDs', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const id1 = getVoterId();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const id2 = getVoterId();
    expect(id1).not.toBe(id2);
  });

  it('handles server-side rendering (no window)', () => {
    delete (global as { window?: Window }).window;
    const voterId = getVoterId();
    expect(voterId).toMatch(/^voter_\d+$/);
    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('includes timestamp in voter ID', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const before = Date.now();
    const voterId = getVoterId();
    const after = Date.now();
    const timestamp = parseInt(voterId.split('_')[1]);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});
