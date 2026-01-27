import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as agents from './agents';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  API_ENDPOINTS: {
    deploy: '/api/agents/deploy',
    agents: {
      list: '/api/agents',
      detail: (id: string) => `/api/agents/${id}`,
      start: (id: string) => `/api/agents/${id}/start`,
      stop: (id: string) => `/api/agents/${id}/stop`,
      restart: (id: string) => `/api/agents/${id}/restart`,
      status: (id: string) => `/api/agents/${id}/status`,
      logs: (id: string) => `/api/agents/${id}/logs`,
    },
  },
}));

describe('agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deployAgent', () => {
    it('deploys agent successfully', async () => {
      const mockResponse = { agentId: 'agent1', machineId: 'machine1' };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await agents.deployAgent({ name: 'Test Agent', config: {} });
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request' }),
      } as Response);

      await expect(agents.deployAgent({ name: '', config: {} })).rejects.toThrow('Invalid request');
    });
  });

  describe('getAgents', () => {
    it('fetches agents list', async () => {
      const mockAgents = [{ id: 'agent1', name: 'Agent 1' }];
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ agents: mockAgents }),
      } as Response);

      const agentsList = await agents.getAgents();
      expect(agentsList).toEqual(mockAgents);
    });
  });

  describe('getAgent', () => {
    it('fetches single agent', async () => {
      const mockAgent = { id: 'agent1', name: 'Agent 1' };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ agent: mockAgent }),
      } as Response);

      const agent = await agents.getAgent('agent1');
      expect(agent).toEqual(mockAgent);
    });
  });

  describe('startAgent', () => {
    it('starts agent successfully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await agents.startAgent('agent1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('stopAgent', () => {
    it('stops agent successfully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await agents.stopAgent('agent1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('restartAgent', () => {
    it('restarts agent successfully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await agents.restartAgent('agent1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('deleteAgent', () => {
    it('deletes agent successfully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await agents.deleteAgent('agent1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getAgentStatus', () => {
    it('fetches agent status', async () => {
      const mockStatus = { status: 'running', uptime: 3600 };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const status = await agents.getAgentStatus('agent1');
      expect(status).toEqual(mockStatus);
    });
  });

  describe('getAgentLogs', () => {
    it('fetches agent logs', async () => {
      const mockLogs = { logs: [{ message: 'Test log' }], nextToken: 'token123' };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLogs,
      } as Response);

      const logs = await agents.getAgentLogs('agent1', { limit: 10 });
      expect(logs).toEqual(mockLogs);
    });
  });
});
