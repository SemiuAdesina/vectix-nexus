import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { OwnershipWatermark } from './ownership-watermark';

describe('OwnershipWatermark', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('renders without crashing', () => {
    const { container } = render(<OwnershipWatermark />);
    expect(container).toBeDefined();
  });

  it('logs ownership information to console', () => {
    render(<OwnershipWatermark />);
    expect(console.info).toHaveBeenCalled();
  });

  it('includes copyright notice in console output', () => {
    render(<OwnershipWatermark />);
    const callArgs = (console.info as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0]).toContain('VectixLogic Platform');
    expect(callArgs[0]).toContain('2026 Vectix Logic LLC');
  });

  it('returns null (no visible DOM elements)', () => {
    const { container } = render(<OwnershipWatermark />);
    expect(container.innerHTML).toBe('');
  });
});
