import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShowcaseSection } from './showcase-section';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="showcase-image" />
  ),
}));

const defaultProps = {
  title: 'The Intelligence',
  highlight: 'Factory',
  description: 'Deploy and manage AI agents powered by ElizaOS.',
  imageSrc: '/landingpage/intelegentfac.png',
  imageAlt: 'Intelligence Factory',
};

describe('ShowcaseSection', () => {
  it('renders the title text', () => {
    render(<ShowcaseSection {...defaultProps} />);
    expect(screen.getByText('The Intelligence')).toBeInTheDocument();
  });

  it('renders the highlight with teal color', () => {
    render(<ShowcaseSection {...defaultProps} />);
    const highlight = screen.getByText('Factory');
    expect(highlight).toBeInTheDocument();
    expect(highlight.className).toContain('text-teal-400');
  });

  it('renders the description', () => {
    render(<ShowcaseSection {...defaultProps} />);
    expect(screen.getByText(/Deploy and manage AI agents/i)).toBeInTheDocument();
  });

  it('renders the image with correct src and alt', () => {
    render(<ShowcaseSection {...defaultProps} />);
    const img = screen.getByTestId('showcase-image');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/landingpage/intelegentfac.png');
    expect(img.getAttribute('alt')).toBe('Intelligence Factory');
  });

  it('applies default (non-reversed) layout', () => {
    const { container } = render(<ShowcaseSection {...defaultProps} />);
    const flexContainer = container.querySelector('.lg\\:flex-row');
    expect(flexContainer).toBeInTheDocument();
  });

  it('applies reversed layout when reverse is true', () => {
    const { container } = render(<ShowcaseSection {...defaultProps} reverse />);
    const flexContainer = container.querySelector('.lg\\:flex-row-reverse');
    expect(flexContainer).toBeInTheDocument();
  });

  it('renders different content for each section', () => {
    const { rerender } = render(<ShowcaseSection {...defaultProps} />);
    expect(screen.getByText('The Intelligence')).toBeInTheDocument();

    rerender(
      <ShowcaseSection
        title="Shield of"
        highlight="Compliance"
        description="Full adherence to US financial regulations."
        imageSrc="/landingpage/shield.png"
        imageAlt="Shield"
      />
    );
    expect(screen.getByText('Shield of')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });
});
