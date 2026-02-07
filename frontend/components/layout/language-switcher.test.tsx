import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './language-switcher';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useTransition: () => [false, vi.fn()],
  };
});

describe('LanguageSwitcher', () => {
  it('renders locale buttons', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: /en/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /es/i })).toBeInTheDocument();
  });

  it('marks current locale as active', () => {
    render(<LanguageSwitcher />);
    const enButton = screen.getByRole('button', { name: 'en' });
    expect(enButton).toHaveClass('text-teal-400');
  });
});
