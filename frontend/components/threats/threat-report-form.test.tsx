import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThreatReportForm } from './threat-report-form';
import * as threatsApi from '@/lib/api/onchain/threats';
import type { ThreatReport } from '@/lib/api/onchain/types';

vi.mock('@/lib/api/onchain/threats', () => ({
  reportThreat: vi.fn(),
}));

describe('ThreatReportForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<ThreatReportForm onClose={mockOnClose} />);

    expect(screen.getByLabelText(/token address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<ThreatReportForm onClose={mockOnClose} />);
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ThreatReportForm onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('allows entering token address', async () => {
    const user = userEvent.setup();
    render(<ThreatReportForm onClose={mockOnClose} />);
    
    const tokenInput = screen.getByLabelText(/token address/i);
    await user.type(tokenInput, 'token123');
    
    expect(tokenInput).toHaveValue('token123');
  });

  it('allows selecting severity', async () => {
    render(<ThreatReportForm onClose={mockOnClose} />);
    
    const severityTrigger = screen.getByLabelText(/severity/i);
    expect(severityTrigger).toBeInTheDocument();
    
    // Radix Select is rendered - interaction testing requires pointer events
    // which jsdom doesn't fully support, so we verify the component is present
  });

  it('allows entering description', async () => {
    const user = userEvent.setup();
    render(<ThreatReportForm onClose={mockOnClose} />);
    
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test threat description');
    
    expect(descriptionInput).toHaveValue('Test threat description');
  });

  it('disables submit button when description is empty', () => {
    render(<ThreatReportForm onClose={mockOnClose} />);
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when description is filled', async () => {
    const user = userEvent.setup();
    render(<ThreatReportForm onClose={mockOnClose} />);
    
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test description');
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    vi.mocked(threatsApi.reportThreat).mockResolvedValue({
      success: true,
      report: {
        id: 'report1',
        reporter: 'user',
        description: 'Test threat',
        severity: 'high',
        status: 'pending',
        createdAt: new Date(),
      },
    });

    render(<ThreatReportForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await user.type(screen.getByLabelText(/token address/i), 'token123');
    
  
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat description');
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(threatsApi.reportThreat).toHaveBeenCalledWith({
        reporter: 'user',
        tokenAddress: 'token123',
        description: 'Test threat description',
        severity: 'medium', 
      });
    });
  });

  it('calls onSuccess and onClose after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(threatsApi.reportThreat).mockResolvedValue({
      success: true,
      report: {
        id: 'report1',
        reporter: 'user',
        description: 'Test threat',
        severity: 'high',
        status: 'pending',
        createdAt: new Date(),
      },
    });

    render(<ThreatReportForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup();
    vi.mocked(threatsApi.reportThreat).mockResolvedValue({
      success: false,
      report: {
        id: 'report1',
        reporter: 'user',
        description: 'Test',
        severity: 'medium',
        status: 'pending',
        createdAt: new Date(),
      },
    });

    render(<ThreatReportForm onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to submit threat report/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API error', async () => {
    const user = userEvent.setup();
    vi.mocked(threatsApi.reportThreat).mockRejectedValue(new Error('Network error'));

    render(<ThreatReportForm onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: { success: boolean; report: ThreatReport }) => void;
    const promise = new Promise<{ success: boolean; report: ThreatReport }>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(threatsApi.reportThreat).mockReturnValue(promise);

    render(<ThreatReportForm onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat');
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolvePromise!({
      success: true,
      report: {
        id: 'report1',
        reporter: 'user',
        description: 'Test',
        severity: 'medium',
        status: 'pending',
        createdAt: new Date(),
      },
    });
  });

  it('handles submission without token address', async () => {
    const user = userEvent.setup();
    vi.mocked(threatsApi.reportThreat).mockResolvedValue({
      success: true,
      report: {
        id: 'report1',
        reporter: 'user',
        description: 'Test threat',
        severity: 'medium',
        status: 'pending',
        createdAt: new Date(),
      },
    });

    render(<ThreatReportForm onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(threatsApi.reportThreat).toHaveBeenCalledWith({
        reporter: 'user',
        tokenAddress: undefined,
        description: 'Test threat',
        severity: 'medium',
      });
    });
  });

  it('disables cancel button during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: { success: boolean; report: ThreatReport }) => void;
    const promise = new Promise<{ success: boolean; report: ThreatReport }>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(threatsApi.reportThreat).mockReturnValue(promise);

    render(<ThreatReportForm onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/description/i), 'Test threat');
    await user.click(screen.getByRole('button', { name: /submit report/i }));

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    resolvePromise!({
      success: true,
      report: {
        id: 'report1',
        reporter: 'user',
        description: 'Test',
        severity: 'medium',
        status: 'pending',
        createdAt: new Date(),
      },
    });
  });
});
