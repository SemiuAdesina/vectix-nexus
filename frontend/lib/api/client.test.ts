import { describe, it, expect } from 'vitest';
import * as client from './client';

describe('client', () => {
  it('exports client functions', () => {
    expect(client.deployAgent).toBeDefined();
    expect(client.getAgents).toBeDefined();
    expect(client.getAgentBalance).toBeDefined();
    expect(client.getSubscriptionStatus).toBeDefined();
  });
});
