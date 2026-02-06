import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroSection } from './hero-section';

const mockUseAuth = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
  SignInButton: ({ children }: { children: React.ReactNode }) => <div data-testid="sign-in-cta">{children}</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in-cta">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out-cta">{children}</div>,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="hero-image" {...props} />
  ),
}));

describe('HeroSection', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isLoaded: true });
  });

  it('renders the mainnet badge', () => {
    render(<HeroSection />);
    expect(screen.getByText('Now Live on Solana Mainnet')).toBeInTheDocument();
  });

  it('renders the headline', () => {
    render(<HeroSection />);
    expect(screen.getByText('Enterprise AI Agents')).toBeInTheDocument();
    expect(screen.getByText('on Solana')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/institutional-grade security/i)).toBeInTheDocument();
    expect(screen.getByText(/Built on ElizaOS/i)).toBeInTheDocument();
  });

  it('renders CTA buttons for signed-out users', () => {
    render(<HeroSection />);
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('View Pricing')).toBeInTheDocument();
  });

  it('renders CTA buttons for signed-in users', () => {
    render(<HeroSection />);
    expect(screen.getByText('Create Your Agent')).toBeInTheDocument();
  });

  it('renders the hero image', () => {
    render(<HeroSection />);
    const img = screen.getByTestId('hero-image');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/landingpage/hero_sec.png');
    expect(img.getAttribute('alt')).toBe('Vectix Foundry Platform');
  });

  it('shows loading spinner when auth not loaded', () => {
    mockUseAuth.mockReturnValue({ isLoaded: false });
    const { container } = render(<HeroSection />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('links pricing CTA to /pricing', () => {
    render(<HeroSection />);
    const pricingLink = screen.getByText('View Pricing').closest('a');
    expect(pricingLink).toHaveAttribute('href', '/pricing');
  });

  it('links create CTA to /create', () => {
    render(<HeroSection />);
    const createLink = screen.getByText('Create Your Agent').closest('a');
    expect(createLink).toHaveAttribute('href', '/create');
  });
});
