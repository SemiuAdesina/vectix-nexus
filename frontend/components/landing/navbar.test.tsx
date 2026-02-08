import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from './navbar';

const mockUseAuth = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
  SignInButton: ({ children }: { children: React.ReactNode }) => <div data-testid="sign-in-button">{children}</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
  UserButton: () => <div data-testid="user-button">UserButton</div>,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, Record<string, string>> = {
      Common: { signIn: 'Sign In', pricing: 'Pricing', dashboard: 'Dashboard' },
      HomePage: { title: 'Vectix Foundry' },
    };
    return map[ns]?.[key] ?? key;
  },
  useLocale: () => 'en',
}));

describe('Navbar', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isLoaded: true });
  });

  it('renders Vectix Foundry branding', () => {
    render(<Navbar />);
    expect(screen.getByText('Vectix Foundry')).toBeInTheDocument();
  });

  it('renders pricing link', () => {
    render(<Navbar />);
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders sign-in button when loaded', () => {
    render(<Navbar />);
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });

  it('renders dashboard link for signed-in users', () => {
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders user button for signed-in users', () => {
    render(<Navbar />);
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('shows loading spinner when auth not loaded', () => {
    mockUseAuth.mockReturnValue({ isLoaded: false });
    const { container } = render(<Navbar />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has sticky positioning and stays at top when scrolling', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('sticky');
    expect(nav.className).toContain('top-0');
    expect(nav.className).toContain('z-50');
  });
});
