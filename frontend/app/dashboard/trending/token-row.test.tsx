import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TokenRowDesktop, TokenCardMobile } from './token-row';
import { SafeToken } from '@/lib/api/security';

const mockToken: SafeToken = {
  address: '0x123',
  symbol: 'TEST',
  name: 'Test Token',
  trustScore: 85,
  trustGrade: 'A',
  priceChange24h: 5.5,
  volume24h: 1000000,
  liquidityUsd: 500000,
  priceUsd: 1.5,
  marketCap: 10000000,
};

describe('TokenRowDesktop', () => {
  it('renders token symbol', () => {
    render(<TokenRowDesktop token={mockToken} rank={1} />);
    expect(screen.getByText('$TEST')).toBeInTheDocument();
  });

  it('renders token name', () => {
    render(<TokenRowDesktop token={mockToken} rank={1} />);
    expect(screen.getByText('Test Token')).toBeInTheDocument();
  });

  it('renders rank', () => {
    render(<TokenRowDesktop token={mockToken} rank={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders trust score with grade', () => {
    render(<TokenRowDesktop token={mockToken} rank={1} />);
    expect(screen.getByText('85 (A)')).toBeInTheDocument();
  });

  it('renders analyze button', () => {
    render(<TokenRowDesktop token={mockToken} rank={1} />);
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });
});

describe('TokenCardMobile', () => {
  it('renders token symbol', () => {
    render(<TokenCardMobile token={mockToken} rank={1} />);
    expect(screen.getByText('$TEST')).toBeInTheDocument();
  });

  it('renders token name', () => {
    render(<TokenCardMobile token={mockToken} rank={1} />);
    expect(screen.getByText('Test Token')).toBeInTheDocument();
  });

  it('renders rank', () => {
    render(<TokenCardMobile token={mockToken} rank={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders trust score', () => {
    render(<TokenCardMobile token={mockToken} rank={1} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders analyze button', () => {
    render(<TokenCardMobile token={mockToken} rank={1} />);
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });
});
