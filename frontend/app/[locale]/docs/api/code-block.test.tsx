import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeBlock } from './code-block';

const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.assign(navigator, { clipboard: mockClipboard });

describe('CodeBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders code content', () => {
    render(<CodeBlock>const x = 1;</CodeBlock>);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders in a pre element', () => {
    render(<CodeBlock>code here</CodeBlock>);
    const pre = screen.getByText('code here').closest('pre');
    expect(pre).toBeInTheDocument();
  });

  it('copies content to clipboard on button click', async () => {
    render(<CodeBlock>copy this</CodeBlock>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('copy this');
  });

  it('shows check icon after copying', async () => {
    render(<CodeBlock>test code</CodeBlock>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button.querySelector('svg')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
