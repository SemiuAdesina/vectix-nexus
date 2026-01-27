import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logAuditEvent } from '../services/audit/audit.service';

const router = Router();

interface BugReport {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'smart-contract' | 'frontend' | 'backend' | 'api' | 'other';
  stepsToReproduce: string;
  impact: string;
  reporterEmail?: string;
  reporterWallet?: string;
}

router.post('/security/bug-report', async (req: Request, res: Response) => {
  try {
    const report: BugReport = req.body;

    if (!report.title || !report.description || !report.severity || !report.category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, severity, category',
      });
    }

    const bugReport = await (prisma as any).bugReport.create({
      data: {
        title: report.title,
        description: report.description,
        severity: report.severity,
        category: report.category,
        stepsToReproduce: report.stepsToReproduce || '',
        impact: report.impact || '',
        reporterEmail: report.reporterEmail,
        reporterWallet: report.reporterWallet,
        status: 'pending',
      },
    });

    await logAuditEvent(
      'security.bug_report',
      {
        userId: 'public',
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      },
      {
        bugReportId: bugReport.id,
        severity: report.severity,
        category: report.category,
      },
      true
    );

    res.json({
      success: true,
      reportId: bugReport.id,
      message: 'Bug report submitted successfully. Our security team will review it.',
    });
  } catch (error) {
    console.error('Bug report error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit bug report' });
  }
});

router.get('/security/researchers', async (_req: Request, res: Response) => {
  try {
    const researchers = await (prisma as any).bugReport.groupBy({
      by: ['reporterWallet'],
      where: {
        reporterWallet: { not: null },
        status: { in: ['confirmed', 'resolved'] },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 50,
    });

    res.json({
      success: true,
      researchers: researchers
        .filter((r: { reporterWallet: string | null }) => r.reporterWallet)
        .map((r: { reporterWallet: string; _count: { id: number } }) => ({
          wallet: r.reporterWallet,
          reportsCount: r._count.id,
        })),
    });
  } catch (error) {
    console.error('Researchers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch researchers', researchers: [] });
  }
});

export default router;
