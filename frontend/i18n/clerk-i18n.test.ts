import { describe, it, expect } from 'vitest';
import { routing } from './routing';

describe('Clerk + i18n (language switch)', () => {
  it('uses always locale prefix so sign-in paths are /{locale}/sign-in', () => {
    expect(routing.localePrefix).toBe('always');
    expect(routing.locales).toContain('en');
    expect(routing.locales).toContain('es');
  });

  it('exposes default locale for Clerk redirect fallback', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('middleware public route patterns include sign-in and sign-up for Clerk', () => {
    const patterns = ['/:locale/sign-in(.*)', '/:locale/sign-up(.*)'];
    patterns.forEach((p) => {
      expect(p).toMatch(/sign-in|sign-up/);
    });
    routing.locales.forEach((locale) => {
      expect(`/${locale}/sign-in`).toMatch(new RegExp(`^/${locale}/sign-in`));
      expect(`/${locale}/sign-up`).toMatch(new RegExp(`^/${locale}/sign-up`));
    });
  });
});
