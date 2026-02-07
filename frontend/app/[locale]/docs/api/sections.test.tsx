import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  QuickStart,
  Authentication,
  EndpointsSection,
  TradeExample,
  RateLimitsSection,
  SdksSection,
} from './sections';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

describe('QuickStart', () => {
  it('renders section title', () => {
    render(<QuickStart />);
    expect(screen.getByText('Quick Start')).toBeInTheDocument();
  });

  it('renders step 1', () => {
    render(<QuickStart />);
    expect(screen.getByText('1. Get your API Key')).toBeInTheDocument();
  });

  it('renders step 2', () => {
    render(<QuickStart />);
    expect(screen.getByText('2. Make your first request')).toBeInTheDocument();
  });

  it('renders step 3', () => {
    render(<QuickStart />);
    expect(screen.getByText('3. Example Response')).toBeInTheDocument();
  });

  it('includes curl example', () => {
    render(<QuickStart />);
    expect(screen.getByText(/curl -X GET/)).toBeInTheDocument();
  });

  it('links to API keys page', () => {
    render(<QuickStart />);
    expect(screen.getByText('/dashboard/api-keys')).toHaveAttribute(
      'href',
      '/dashboard/api-keys'
    );
  });
});

describe('Authentication', () => {
  it('renders section title', () => {
    render(<Authentication />);
    expect(screen.getByText('Authentication')).toBeInTheDocument();
  });

  it('mentions x-api-key header', () => {
    render(<Authentication />);
    expect(screen.getByText('x-api-key')).toBeInTheDocument();
  });

  it('includes curl example', () => {
    render(<Authentication />);
    expect(screen.getByText(/curl -H/)).toBeInTheDocument();
  });
});

describe('EndpointsSection', () => {
  it('renders section title', () => {
    render(<EndpointsSection />);
    expect(screen.getByText('Endpoints')).toBeInTheDocument();
  });

  it('renders endpoints table', () => {
    render(<EndpointsSection />);
    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Endpoint')).toBeInTheDocument();
  });
});

describe('TradeExample', () => {
  it('renders section title', () => {
    render(<TradeExample />);
    expect(screen.getByText('Execute a Trade')).toBeInTheDocument();
  });

  it('includes trade endpoint example', () => {
    render(<TradeExample />);
    expect(screen.getByText(/agents\/abc123\/trade/)).toBeInTheDocument();
  });

  it('shows paper mode note', () => {
    render(<TradeExample />);
    expect(screen.getByText(/Free tier keys/)).toBeInTheDocument();
    expect(screen.getAllByText(/paper/).length).toBeGreaterThan(0);
  });
});

describe('RateLimitsSection', () => {
  it('renders section title', () => {
    render(<RateLimitsSection />);
    expect(screen.getByText('Rate Limits & Errors')).toBeInTheDocument();
  });

  it('displays rate limits', () => {
    render(<RateLimitsSection />);
    expect(screen.getByText(/100 requests\/day/)).toBeInTheDocument();
    expect(screen.getByText(/10,000 requests\/day/)).toBeInTheDocument();
  });

  it('displays error codes', () => {
    render(<RateLimitsSection />);
    expect(screen.getByText('401')).toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('429')).toBeInTheDocument();
  });
});

describe('SdksSection', () => {
  it('renders section title', () => {
    render(<SdksSection />);
    expect(screen.getByText('SDKs & Libraries')).toBeInTheDocument();
  });

  it('mentions coming soon', () => {
    render(<SdksSection />);
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });

  it('has link to API keys', () => {
    render(<SdksSection />);
    expect(screen.getByText('Get Your API Key')).toBeInTheDocument();
  });
});
