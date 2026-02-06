import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformWatermark, PlatformFooter } from './platform-watermark';

describe('PlatformWatermark', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('renders without crashing', () => {
    const { container } = render(<PlatformWatermark />);
    expect(container).toBeDefined();
  });

  it('logs ownership information to console', () => {
    render(<PlatformWatermark />);
    expect(console.info).toHaveBeenCalled();
  });

  it('includes copyright notice in console output', () => {
    render(<PlatformWatermark />);
    const callArgs = (console.info as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0]).toContain('Vectix Foundry Platform');
    expect(callArgs[0]).toContain('2026 Vectix Logic LLC');
  });

  it('includes license information in console output', () => {
    render(<PlatformWatermark />);
    const callArgs = (console.info as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0]).toContain('Business Source License 1.1');
  });

  it('returns null (no visible DOM elements)', () => {
    const { container } = render(<PlatformWatermark />);
    expect(container.innerHTML).toBe('');
  });
});

describe('PlatformFooter', () => {
  it('renders footer element', () => {
    render(<PlatformFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeDefined();
  });

  it('displays Vectix Foundry branding', () => {
    render(<PlatformFooter />);
    expect(screen.getByText('Vectix Foundry Compliance Engine™')).toBeDefined();
  });

  it('displays platform secured message', () => {
    render(<PlatformFooter />);
    expect(screen.getByText('Platform Secured by')).toBeDefined();
  });

  it('displays version number', () => {
    render(<PlatformFooter />);
    expect(screen.getByText('v1.0.0')).toBeDefined();
  });

  it('has correct styling classes', () => {
    render(<PlatformFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('text-center');
    expect(footer.className).toContain('border-t');
  });
});
