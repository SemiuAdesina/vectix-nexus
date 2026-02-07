import { describe, it, expect } from 'vitest';
import { routing } from './routing';

describe('i18n routing', () => {
  it('defines supported locales', () => {
    expect(routing.locales).toContain('en');
    expect(routing.locales).toContain('es');
    expect(routing.locales).toHaveLength(2);
  });

  it('uses en as default locale', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('uses always prefix for locale', () => {
    expect(routing.localePrefix).toBe('always');
  });
});
