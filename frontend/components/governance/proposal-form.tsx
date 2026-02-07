'use client';

import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { createGovernanceProposal } from '@/lib/api/onchain';
import { ProposalFormFields } from './proposal-form-fields';

interface ProposalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  type: 'security_rule' as const,
  targetRule: '',
  proposedValue: '',
  quorum: 5,
};

export function ProposalForm({ onSuccess, onCancel }: ProposalFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const resetForm = () => setFormData(INITIAL_FORM_DATA);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const proposalData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        quorum: formData.quorum,
        ...(formData.type === 'security_rule' && formData.targetRule && {
          targetRule: formData.targetRule,
          proposedValue: formData.proposedValue,
        }),
      };

      const result = await createGovernanceProposal(proposalData);
      if (result.success) {
        resetForm();
        toast.success('Proposal created successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create proposal:', error);
      const msg = error instanceof Error && error.message.includes('HTML') ? 'Governance API not available. Ensure the backend is running.' : 'Failed to create proposal. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-semibold text-white">Create Proposal</h2>
        <button
          onClick={() => {
            resetForm();
            onCancel();
          }}
          className="p-1.5 hover:bg-teal-500/10 hover:text-teal-400 rounded-lg transition-colors text-slate-400"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <ProposalFormFields formData={formData} onChange={handleChange} />
        <div className="flex gap-2 pt-1 sm:pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Create Proposal
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-teal-500/30 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
