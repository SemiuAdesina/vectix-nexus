import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeaturesGrid } from './features-grid';

describe('FeaturesGrid', () => {
  it('renders the section heading', () => {
    render(<FeaturesGrid />);
    expect(screen.getByText('Built for')).toBeInTheDocument();
    expect(screen.getByText('Institutional Grade')).toBeInTheDocument();
  });

  it('renders the section description', () => {
    render(<FeaturesGrid />);
    expect(screen.getByText(/Enterprise security infrastructure/i)).toBeInTheDocument();
  });

  it('renders all four feature cards', () => {
    render(<FeaturesGrid />);
    expect(screen.getByText('AI-Powered Agents')).toBeInTheDocument();
    expect(screen.getByText('Secure Wallets')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument();
    expect(screen.getByText('Institutional Security')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeaturesGrid />);
    expect(screen.getByText(/Autonomous trading agents built on ElizaOS/i)).toBeInTheDocument();
    expect(screen.getByText(/AES-256-GCM encrypted Solana wallets/i)).toBeInTheDocument();
    expect(screen.getByText(/Live performance monitoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Pre-flight simulation, TEE encryption/i)).toBeInTheDocument();
  });

  it('renders four card elements', () => {
    const { container } = render(<FeaturesGrid />);
    const cards = container.querySelectorAll('.group');
    expect(cards.length).toBe(4);
  });

  it('feature cards have hover transitions', () => {
    const { container } = render(<FeaturesGrid />);
    const cards = container.querySelectorAll('.group');
    cards.forEach((card) => {
      expect(card.className).toContain('hover:border-teal-500/30');
      expect(card.className).toContain('transition-all');
    });
  });

  it('renders icon containers with teal background', () => {
    const { container } = render(<FeaturesGrid />);
    const iconContainers = container.querySelectorAll('.bg-teal-500\\/10');
    expect(iconContainers.length).toBeGreaterThanOrEqual(4);
  });
});
