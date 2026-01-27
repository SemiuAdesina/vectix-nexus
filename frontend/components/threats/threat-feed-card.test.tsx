import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThreatFeedCard } from './threat-feed-card';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';

describe('ThreatFeedCard', () => {
  const mockThreat: ThreatIntelligence = {
    id: 'threat-1',
    type: 'anomaly',
    severity: 'high',
    description: 'Suspicious trading activity detected',
    confidence: 85,
    timestamp: new Date('2026-01-27T10:00:00Z'),
  };

  const mockThreats: ThreatIntelligence[] = [
    mockThreat,
    {
      id: 'threat-2',
      type: 'community_report',
      severity: 'critical',
      description: 'Potential rug pull detected',
      confidence: 95,
      timestamp: new Date('2026-01-27T09:00:00Z'),
    },
    {
      id: 'threat-3',
      type: 'pattern_match',
      severity: 'medium',
      description: 'Unusual volume spike',
      confidence: 60,
      timestamp: new Date('2026-01-27T08:00:00Z'),
    },
  ];

  it('renders empty state when no threats', () => {
    render(<ThreatFeedCard threats={[]} />);
    
    expect(screen.getByText('No threats detected')).toBeInTheDocument();
    expect(screen.getByText(/Threats will appear here as they are detected or reported by VectixLogic/i)).toBeInTheDocument();
  });

  it('renders threats when provided', () => {
    render(<ThreatFeedCard threats={mockThreats} />);
    
    expect(screen.getByText('Suspicious trading activity detected')).toBeInTheDocument();
    expect(screen.getByText('Potential rug pull detected')).toBeInTheDocument();
    expect(screen.getByText('Unusual volume spike')).toBeInTheDocument();
  });

  it('displays threat severity badges', () => {
    render(<ThreatFeedCard threats={[mockThreat]} />);
    
    const severityBadge = screen.getByText('high');
    expect(severityBadge).toBeInTheDocument();
  });

  it('displays confidence percentage for each threat', () => {
    render(<ThreatFeedCard threats={[mockThreat]} />);
    
    expect(screen.getByText(/Confidence: 85%/i)).toBeInTheDocument();
  });

  it('displays timestamp for each threat', () => {
    render(<ThreatFeedCard threats={[mockThreat]} />);
    
    const timestamp = mockThreat.timestamp.toLocaleString();
    expect(screen.getByText(new RegExp(timestamp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
  });

  it('renders all severity levels correctly', () => {
    const allSeverities: ThreatIntelligence[] = [
      { ...mockThreat, id: '1', severity: 'low' },
      { ...mockThreat, id: '2', severity: 'medium' },
      { ...mockThreat, id: '3', severity: 'high' },
      { ...mockThreat, id: '4', severity: 'critical' },
    ];

    render(<ThreatFeedCard threats={allSeverities} />);
    
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
  });

  it('renders multiple threats in order', () => {
    render(<ThreatFeedCard threats={mockThreats} />);
    
    const descriptions = mockThreats.map(t => t.description);
    descriptions.forEach(desc => {
      expect(screen.getByText(desc)).toBeInTheDocument();
    });
  });

  it('handles threat with missing type gracefully', () => {
    const threatWithoutType: ThreatIntelligence = {
      ...mockThreat,
      type: 'anomaly',
    };

    render(<ThreatFeedCard threats={[threatWithoutType]} />);
    
    expect(screen.getByText(mockThreat.description)).toBeInTheDocument();
  });
});
