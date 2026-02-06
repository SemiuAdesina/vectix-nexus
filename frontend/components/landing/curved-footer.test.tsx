import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CurvedFooter } from './curved-footer';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('CurvedFooter', () => {
  it('renders Vectix Foundry branding', () => {
    render(<CurvedFooter />);
    expect(screen.getByText('Vectix Foundry')).toBeInTheDocument();
  });

  it('renders the platform description', () => {
    render(<CurvedFooter />);
    expect(screen.getByText(/Enterprise-grade autonomous AI trading agents/i)).toBeInTheDocument();
  });

  it('renders platform navigation links', () => {
    render(<CurvedFooter />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create Agent')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('renders correct link hrefs', () => {
    render(<CurvedFooter />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Create Agent').closest('a')).toHaveAttribute('href', '/create');
    expect(screen.getByText('Pricing').closest('a')).toHaveAttribute('href', '/pricing');
    expect(screen.getByText('API Keys').closest('a')).toHaveAttribute('href', '/dashboard/api-keys');
  });

  it('renders built-with tech stack', () => {
    render(<CurvedFooter />);
    expect(screen.getByText('ElizaOS Framework')).toBeInTheDocument();
    expect(screen.getByText('Solana Blockchain')).toBeInTheDocument();
    expect(screen.getByText('Phala TEE Network')).toBeInTheDocument();
    expect(screen.getByText('Prisma ORM')).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<CurvedFooter />);
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Built With')).toBeInTheDocument();
  });

  it('renders bottom bar with copyright', () => {
    render(<CurvedFooter />);
    expect(screen.getByText('Vectix Foundry - Institutional AI Trading')).toBeInTheDocument();
  });

  it('renders get started CTA link', () => {
    render(<CurvedFooter />);
    const ctaLink = screen.getByText('Get Started').closest('a');
    expect(ctaLink).toHaveAttribute('href', '/create');
  });

  it('applies curved top border radius', () => {
    const { container } = render(<CurvedFooter />);
    const curvedDiv = container.querySelector('.rounded-t-\\[2rem\\]');
    expect(curvedDiv).toBeInTheDocument();
  });

  it('uses dark background for footer', () => {
    const { container } = render(<CurvedFooter />);
    const footerBg = container.querySelector('.bg-slate-900');
    expect(footerBg).toBeInTheDocument();
  });
});
