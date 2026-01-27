import { ARIA_LIVE_REGIONS, WCAG_COLORS } from './constants';

describe('ARIA_LIVE_REGIONS', () => {
  it('has polite value', () => {
    expect(ARIA_LIVE_REGIONS.POLITE).toBe('polite');
  });

  it('has assertive value', () => {
    expect(ARIA_LIVE_REGIONS.ASSERTIVE).toBe('assertive');
  });

  it('has off value', () => {
    expect(ARIA_LIVE_REGIONS.OFF).toBe('off');
  });
});

describe('WCAG_COLORS', () => {
  it('has text colors', () => {
    expect(WCAG_COLORS.textPrimary).toBeDefined();
    expect(WCAG_COLORS.textSecondary).toBeDefined();
  });

  it('has background colors', () => {
    expect(WCAG_COLORS.background).toBeDefined();
    expect(WCAG_COLORS.backgroundAlt).toBeDefined();
  });

  it('has semantic colors', () => {
    expect(WCAG_COLORS.error).toBeDefined();
    expect(WCAG_COLORS.success).toBeDefined();
    expect(WCAG_COLORS.warning).toBeDefined();
  });

  it('has valid hex colors', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    Object.values(WCAG_COLORS).forEach((color) => {
      expect(color).toMatch(hexRegex);
    });
  });
});
