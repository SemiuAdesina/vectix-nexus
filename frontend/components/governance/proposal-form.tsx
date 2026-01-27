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
      toast.error('Failed to create proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Create Proposal</h2>
        <button
          onClick={() => {
            resetForm();
            onCancel();
          }}
          className="p-1 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProposalFormFields formData={formData} onChange={handleChange} />
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
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
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
