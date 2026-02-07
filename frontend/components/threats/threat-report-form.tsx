'use client';

import React, { useState } from 'react';
import { X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { reportThreat } from '@/lib/api/onchain/threats';

interface ThreatReportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const inputClass = 'w-full px-3 sm:px-4 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50';
const labelClass = 'block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white';

export function ThreatReportForm({ onClose, onSuccess }: ThreatReportFormProps) {
  const [formData, setFormData] = useState({
    tokenAddress: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await reportThreat({
        reporter: 'user',
        tokenAddress: formData.tokenAddress || undefined,
        description: formData.description,
        severity: formData.severity,
      });

      if (result.success) {
        setFormData({ tokenAddress: '', description: '', severity: 'medium' });
        onSuccess?.();
        onClose();
      } else {
        setError('Failed to submit threat report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit threat report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-white">Report Threat</h2>
            <p className="text-[10px] sm:text-sm text-slate-400">Submit a threat report to Vectix Foundry security team</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          disabled={submitting}
          className="p-1.5 hover:bg-teal-500/10 hover:text-teal-400 rounded-lg transition-colors text-slate-400 disabled:opacity-50 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <label htmlFor="tokenAddress" className={labelClass}>
            Token Address
            <span className="text-slate-400 ml-1 text-xs">(Optional)</span>
          </label>
          <input
            id="tokenAddress"
            type="text"
            value={formData.tokenAddress}
            onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
            placeholder="Enter Solana token address if applicable"
            disabled={submitting}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="severity" className={labelClass}>Severity Level</label>
          <select
            id="severity"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as typeof formData.severity })}
            disabled={submitting}
            className={inputClass}
          >
            <option value="low">Low - Low Priority</option>
            <option value="medium">Medium - Medium Priority</option>
            <option value="high">High - High Priority</option>
            <option value="critical">Critical - Critical</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className={labelClass}>
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the threat or suspicious activity in detail..."
            required
            rows={5}
            disabled={submitting}
            className={`${inputClass} resize-none`}
          />
          <p className="text-[10px] sm:text-xs text-slate-400">
            Provide as much detail as possible to help our security team investigate
          </p>
        </div>

        {error && (
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 justify-end pt-1 sm:pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.description.trim()}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
