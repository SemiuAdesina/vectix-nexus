import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AgentCreator } from './agent-creator';

describe('AgentCreator', () => {
  it('should render page title', () => {
    render(<AgentCreator />);
    expect(screen.getByText('Create Your AI Agent')).toBeInTheDocument();
  });

  it('should render Configure step', () => {
    render(<AgentCreator />);
    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  it('should show risk level label and default Medium value', () => {
    render(<AgentCreator />);
    expect(screen.getByText(/Risk Level/)).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
