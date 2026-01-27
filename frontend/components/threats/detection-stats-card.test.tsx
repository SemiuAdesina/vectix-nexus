import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DetectionStatsCard } from './detection-stats-card';
import type { ThreatIntelligence } from '@/lib/api/onchain/types';

describe('DetectionStatsCard', () => {
  const mockThreats: ThreatIntelligence[] = [
    {
      id: '1',
      type: 'anomaly',
      severity: 'critical',
      description: 'Critical threat',
      confidence: 95,
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'anomaly',
      severity: 'critical',
      description: 'Another critical threat',
      confidence: 90,
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'anomaly',
      severity: 'high',
      description: 'High threat',
      confidence: 80,
      timestamp: new Date(),
    },
    {
      id: '4',
      type: 'anomaly',
      severity: 'medium',
      description: 'Medium threat',
      confidence: 60,
      timestamp: new Date(),
    },
    {
      id: '5',
      type: 'anomaly',
      severity: 'low',
      description: 'Low threat',
      confidence: 30,
      timestamp: new Date(),
    },
  ];

  it('renders all stat labels', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    expect(screen.getByText('Total Threats')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('displays correct total count', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    const totalBadges = screen.getAllByText('5');
    expect(totalBadges.length).toBeGreaterThan(0);
  });

  it('displays correct critical count', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    const criticalCount = mockThreats.filter(t => t.severity === 'critical').length;
    const criticalBadges = screen.getAllByText(String(criticalCount));
    expect(criticalBadges.length).toBeGreaterThan(0);
  });

  it('displays correct high count', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    const highCount = mockThreats.filter(t => t.severity === 'high').length;
    const highBadges = screen.getAllByText(String(highCount));
    expect(highBadges.length).toBeGreaterThan(0);
  });

  it('displays correct medium count', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    const mediumCount = mockThreats.filter(t => t.severity === 'medium').length;
    const mediumBadges = screen.getAllByText(String(mediumCount));
    expect(mediumBadges.length).toBeGreaterThan(0);
  });

  it('displays correct low count', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    const lowCount = mockThreats.filter(t => t.severity === 'low').length;
    const lowBadges = screen.getAllByText(String(lowCount));
    expect(lowBadges.length).toBeGreaterThan(0);
  });

  it('displays zero counts correctly', () => {
    const emptyThreats: ThreatIntelligence[] = [];
    render(<DetectionStatsCard threats={emptyThreats} />);
    
    const zeroBadges = screen.getAllByText('0');
    expect(zeroBadges.length).toBeGreaterThan(0);
  });

  it('renders card structure correctly', () => {
    render(<DetectionStatsCard threats={mockThreats} />);
    
    expect(screen.getByText('Detection Stats')).toBeInTheDocument();
    expect(screen.getByText(/Threat intelligence metrics by severity/i)).toBeInTheDocument();
  });

  it('handles threats with only one severity level', () => {
    const singleSeverityThreats: ThreatIntelligence[] = [
      {
        id: '1',
        type: 'anomaly',
        severity: 'high',
        description: 'High threat',
        confidence: 80,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'anomaly',
        severity: 'high',
        description: 'Another high threat',
        confidence: 75,
        timestamp: new Date(),
      },
    ];

    render(<DetectionStatsCard threats={singleSeverityThreats} />);
    
    expect(screen.getByText('Total Threats')).toBeInTheDocument();
    const totalBadges = screen.getAllByText('2');
    expect(totalBadges.length).toBeGreaterThan(0);
    
    const highBadges = screen.getAllByText('2');
    expect(highBadges.length).toBeGreaterThan(0);
  });
});
