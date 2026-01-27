import {
  generateUniqueId,
  getContrastRatio,
  meetsContrastRequirement,
} from './utils';

describe('generateUniqueId', () => {
  it('generates ID with prefix', () => {
    const id = generateUniqueId('test');
    expect(id.startsWith('test-')).toBe(true);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUniqueId('id')));
    expect(ids.size).toBe(100);
  });
});

describe('getContrastRatio', () => {
  it('returns 21 for black on white', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for same colors', () => {
    const ratio = getContrastRatio('#000000', '#000000');
    expect(ratio).toBeCloseTo(1, 1);
  });

  it('handles colors without hash', () => {
    const ratio = getContrastRatio('000000', 'ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('calculates correct ratio for gray colors', () => {
    const ratio = getContrastRatio('#767676', '#ffffff');
    expect(ratio).toBeGreaterThan(4.5);
  });
});

describe('meetsContrastRequirement', () => {
  it('returns true for black on white at AA level', () => {
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AA')).toBe(true);
  });

  it('returns true for black on white at AAA level', () => {
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA')).toBe(true);
  });

  it('returns false for low contrast at AA level', () => {
    expect(meetsContrastRequirement('#aaaaaa', '#ffffff', 'AA')).toBe(false);
  });

  it('uses lower threshold for large text', () => {
    expect(meetsContrastRequirement('#767676', '#ffffff', 'AA', true)).toBe(true);
  });

  it('defaults to AA level', () => {
    const result = meetsContrastRequirement('#000000', '#ffffff');
    expect(result).toBe(true);
  });
});
