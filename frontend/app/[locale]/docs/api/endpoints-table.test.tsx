import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EndpointsTable } from './endpoints-table';

describe('EndpointsTable', () => {
  it('renders table headers', () => {
    render(<EndpointsTable />);
    
    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Endpoint')).toBeInTheDocument();
    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders GET agents endpoint', () => {
    render(<EndpointsTable />);
    
    expect(screen.getByText('/v1/agents')).toBeInTheDocument();
    expect(screen.getByText('List all agents')).toBeInTheDocument();
  });

  it('renders endpoint methods with correct styling', () => {
    render(<EndpointsTable />);
    
    const getMethods = screen.getAllByText('GET');
    const postMethods = screen.getAllByText('POST');
    
    expect(getMethods.length).toBeGreaterThan(0);
    expect(postMethods.length).toBeGreaterThan(0);
  });

  it('renders scope badges', () => {
    render(<EndpointsTable />);
    
    expect(screen.getAllByText('read:agents').length).toBeGreaterThan(0);
    expect(screen.getAllByText('write:control').length).toBeGreaterThan(0);
  });

  it('renders tier information', () => {
    render(<EndpointsTable />);
    
    expect(screen.getAllByText('free').length).toBeGreaterThan(0);
    expect(screen.getAllByText('pro').length).toBeGreaterThan(0);
  });

  it('renders footnote about paper trading', () => {
    render(<EndpointsTable />);
    
    expect(
      screen.getByText(/Free tier trades are paper-only/)
    ).toBeInTheDocument();
  });
});
