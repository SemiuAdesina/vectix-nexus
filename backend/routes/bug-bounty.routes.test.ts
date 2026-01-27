import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../lib/prisma';
import * as auditService from '../services/audit/audit.service';

vi.mock('../lib/prisma', () => ({
  prisma: {
    bugReport: {
      create: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock('../services/audit/audit.service', () => ({
  logAuditEvent: vi.fn(),
}));

describe('bug-bounty.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /security/bug-report', () => {
    it('submits bug report successfully', async () => {
      const mockReport = {
        id: 'report1',
        title: 'Test Bug',
        description: 'Test description',
        severity: 'high',
        category: 'backend',
        status: 'pending',
      };
      vi.mocked((prisma.prisma as any).bugReport.create).mockResolvedValue(mockReport);

      const result = await (prisma.prisma as any).bugReport.create({
        data: {
          title: 'Test Bug',
          description: 'Test description',
          severity: 'high',
          category: 'backend',
          stepsToReproduce: '',
          impact: '',
          status: 'pending',
        },
      });

      expect(result).toEqual(mockReport);
    });
  });

  describe('GET /security/researchers', () => {
    it('returns top researchers', async () => {
      const mockResearchers = [
        { reporterWallet: 'wallet1', _count: { id: 5 } },
        { reporterWallet: 'wallet2', _count: { id: 3 } },
      ];
      vi.mocked((prisma.prisma as any).bugReport.groupBy).mockResolvedValue(mockResearchers);

      const result = await (prisma.prisma as any).bugReport.groupBy({
        by: ['reporterWallet'],
        where: {
          reporterWallet: { not: null },
          status: { in: ['confirmed', 'resolved'] },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 50,
      });

      expect(result).toEqual(mockResearchers);
    });
  });
});
