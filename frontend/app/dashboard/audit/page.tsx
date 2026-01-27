'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getAuditTrail, verifyAuditTrail, exportAuditTrail } from '@/lib/api/onchain';
import type { AuditTrailEntry } from '@/lib/api/onchain/types';
import { IntegrityCard } from '@/components/audit/integrity-card';
import { AuditEntriesList } from '@/components/audit/audit-entries-list';

export default function AuditDashboardPage() {
  const [entries, setEntries] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrityCheck, setIntegrityCheck] = useState<{ valid: boolean; invalidEntries: string[] } | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTrail();
    checkIntegrity();
  }, []);

  const fetchTrail = async () => {
    try {
      const data = await getAuditTrail({ limit: 100 });
      if (data.success) {
        setEntries(data.entries.map(e => ({ ...e, timestamp: new Date(e.timestamp) })));
      }
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrity = async () => {
    try {
      const result = await verifyAuditTrail();
      if (result.success) {
        setIntegrityCheck({ valid: result.valid, invalidEntries: result.invalidEntries });
      }
    } catch (error) {
      console.error('Failed to verify integrity:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const blob = await exportAuditTrail(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-trail.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Security Audit Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive security audit trail and compliance reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <IntegrityCard integrityCheck={integrityCheck} />
      <AuditEntriesList entries={entries} />
    </div>
  );
}
