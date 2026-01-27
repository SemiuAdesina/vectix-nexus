import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as routeUtils from './route-utils';
import * as auth from './auth';
import * as prisma from './prisma';

vi.mock('./auth', () => ({
  getUserIdFromRequest: vi.fn(),
}));

vi.mock('./prisma', () => ({
  prisma: {
    agent: {
      findFirst: vi.fn(),
    },
  },
}));

describe('route-utils', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('handleError', () => {
    it('handles Error instance', () => {
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const error = new Error('Test error');

      routeUtils.handleError(res, error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });

    it('handles unknown error type', () => {
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const error = 'String error';

      routeUtils.handleError(res, error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error' });
    });
  });

  describe('requireAuth', () => {
    it('returns userId when authenticated', async () => {
      const req: any = {};
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      vi.mocked(auth.getUserIdFromRequest).mockResolvedValue('user1');

      const userId = await routeUtils.requireAuth(req, res);
      expect(userId).toBe('user1');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns null and sends 401 when not authenticated', async () => {
      const req: any = {};
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      vi.mocked(auth.getUserIdFromRequest).mockResolvedValue(null);

      const userId = await routeUtils.requireAuth(req, res);
      expect(userId).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('findUserAgent', () => {
    it('returns agent when found', async () => {
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const mockAgent = { id: 'agent1', userId: 'user1', name: 'Test Agent' };
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue(mockAgent as any);

      const agent = await routeUtils.findUserAgent('user1', 'agent1', res);
      expect(agent).toEqual(mockAgent);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns null and sends 404 when agent not found', async () => {
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue(null);

      const agent = await routeUtils.findUserAgent('user1', 'agent1', res);
      expect(agent).toBeNull();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Agent not found' });
    });

    it('returns null when agent belongs to different user', async () => {
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      vi.mocked(prisma.prisma.agent.findFirst).mockResolvedValue(null);

      const agent = await routeUtils.findUserAgent('user1', 'agent1', res);
      expect(agent).toBeNull();
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
