import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ThreatIntelligencePage from './page';
import * as threatsApi from '@/lib/api/onchain';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';

vi.mock('@/lib/api/onchain', () => ({
  getThreatFeed: vi.fn(),
  detectThreat: vi.fn(),
}));

vi.mock('@/components/threats/threat-feed-card', () => ({
  ThreatFeedCard: ({ threats }: { threats: ThreatIntelligence[] }) => (
    <div data-testid="threat-feed-card">Threat Feed ({threats.length})</div>
  ),
}));

vi.mock('@/components/threats/detection-stats-card', () => ({
  DetectionStatsCard: ({ threats }: { threats: ThreatIntelligence[] }) => (
    <div data-testid="detection-stats-card">Stats ({threats.length})</div>
  ),
}));

vi.mock('@/components/threats/threat-report-form', () => ({
  ThreatReportForm: ({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) => (
    <div data-testid="threat-report-form">
      <button onClick={onClose}>Close Form</button>
      <button onClick={onSuccess}>Submit Success</button>
    </div>
  ),
}));

describe('ThreatIntelligencePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(threatsApi.getThreatFeed).mockResolvedValue({
      success: true,
      threats: [],
    });
    vi.mocked(threatsApi.detectThreat).mockResolvedValue({
      success: true,
      isAnomaly: false,
      confidence: 0,
      reason: 'No anomalies detected',
    });
  });

  it('renders page title and description', async () => {
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Threat Intelligence')).toBeInTheDocument();
      expect(screen.getByText(/Real-time threat detection and community reporting by VectixLogic/i)).toBeInTheDocument();
    });
  });

  it('renders action buttons', async () => {
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Detect Anomaly')).toBeInTheDocument();
      expect(screen.getByText('Report Threat')).toBeInTheDocument();
    });
  });

  it('fetches threats on mount', async () => {
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(threatsApi.getThreatFeed).toHaveBeenCalledWith(50);
    });
  });

  it('displays loading state initially', () => {
    vi.mocked(threatsApi.getThreatFeed).mockImplementation(() => new Promise(() => {}));
    
    render(<ThreatIntelligencePage />);
    
    // Should show loading spinner
    expect(screen.queryByText('Threat Intelligence')).not.toBeInTheDocument();
  });

  it('shows threat feed card with threats', async () => {
    const mockThreats = [
      {
        id: '1',
        type: 'anomaly' as const,
        severity: 'high' as const,
        description: 'Test threat',
        confidence: 80,
        timestamp: new Date().toISOString(),
      },
    ];

    vi.mocked(threatsApi.getThreatFeed).mockResolvedValue({
      success: true,
      threats: mockThreats,
    });

    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('threat-feed-card')).toBeInTheDocument();
    });
  });

  it('shows detection stats card', async () => {
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('detection-stats-card')).toBeInTheDocument();
    });
  });

  it('opens report form when Report Threat button is clicked', async () => {
    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Report Threat')).toBeInTheDocument();
    });

    const reportButton = screen.getByText('Report Threat');
    await user.click(reportButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('threat-report-form')).toBeInTheDocument();
    });
  });

  it('closes report form when onClose is called', async () => {
    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Report Threat')).toBeInTheDocument();
    });

    const reportButton = screen.getByText('Report Threat');
    await user.click(reportButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('threat-report-form')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close Form');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('threat-report-form')).not.toBeInTheDocument();
    });
  });

  it('calls detectThreat when Detect Anomaly button is clicked', async () => {
    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Detect Anomaly')).toBeInTheDocument();
    });

    const detectButton = screen.getByText('Detect Anomaly');
    await user.click(detectButton);
    
    await waitFor(() => {
      expect(threatsApi.detectThreat).toHaveBeenCalledWith({
        volume: 1000000,
        priceChange: 10,
      });
    });
  });

  it('displays detection result when anomaly is detected', async () => {
    vi.mocked(threatsApi.detectThreat).mockResolvedValue({
      success: true,
      isAnomaly: true,
      confidence: 85,
      reason: 'Unusual volume spike detected',
    });

    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Detect Anomaly')).toBeInTheDocument();
    });

    const detectButton = screen.getByText('Detect Anomaly');
    await user.click(detectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Anomaly Detected')).toBeInTheDocument();
      expect(screen.getByText('Unusual volume spike detected')).toBeInTheDocument();
      expect(screen.getByText('85% Confidence')).toBeInTheDocument();
    });
  });

  it('displays no threat message when no anomaly is detected', async () => {
    vi.mocked(threatsApi.detectThreat).mockResolvedValue({
      success: true,
      isAnomaly: false,
      confidence: 0,
      reason: 'No anomalies detected',
    });

    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Detect Anomaly')).toBeInTheDocument();
    });

    const detectButton = screen.getByText('Detect Anomaly');
    await user.click(detectButton);
    
    await waitFor(() => {
      expect(screen.getByText('No Threats Detected')).toBeInTheDocument();
      expect(screen.getByText('No anomalies detected')).toBeInTheDocument();
    });
  });

  it('disables detect button while detecting', async () => {
    vi.mocked(threatsApi.detectThreat).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        isAnomaly: false,
        confidence: 0,
        reason: 'No anomalies detected',
      }), 100))
    );

    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Detect Anomaly')).toBeInTheDocument();
    });

    const detectButton = screen.getByText('Detect Anomaly');
    await user.click(detectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Detecting...')).toBeInTheDocument();
    });
  });

  it('refreshes threats after successful report submission', async () => {
    const user = userEvent.setup();
    render(<ThreatIntelligencePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Report Threat')).toBeInTheDocument();
    });

    const reportButton = screen.getByText('Report Threat');
    await user.click(reportButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('threat-report-form')).toBeInTheDocument();
    });

    const submitSuccessButton = screen.getByText('Submit Success');
    await user.click(submitSuccessButton);
    
    await waitFor(() => {
      expect(threatsApi.getThreatFeed).toHaveBeenCalledTimes(2);
    });
  });
});
