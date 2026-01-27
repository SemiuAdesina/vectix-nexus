import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as auditTrail from './audit-trail';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('audit-trail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuditTrail', () => {
    it('fetches audit trail entries', async () => {
      const mockResponse = {
        success: true,
        entries: [{ id: 'entry1', agentId: 'agent1' }],
        total: 1,
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await auditTrail.getAuditTrail({ agentId: 'agent1' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyAuditTrail', () => {
    it('verifies audit trail integrity', async () => {
      const mockResponse = { success: true, valid: true, invalidEntries: [] };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await auditTrail.verifyAuditTrail();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportAuditTrail', () => {
    it('exports audit trail as JSON', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/json' });
      (global.fetch as Mock).mockResolvedValue({
        blob: async () => mockBlob,
      } as Response);

      const blob = await auditTrail.exportAuditTrail('json');
      expect(blob).toBe(mockBlob);
    });

    it('exports audit trail as CSV', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      (global.fetch as Mock).mockResolvedValue({
        blob: async () => mockBlob,
      } as Response);

      const blob = await auditTrail.exportAuditTrail('csv');
      expect(blob).toBe(mockBlob);
    });
  });
});
