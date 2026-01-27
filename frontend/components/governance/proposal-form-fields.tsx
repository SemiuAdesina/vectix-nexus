'use client';

interface ProposalFormFieldsProps {
  formData: {
    title: string;
    description: string;
    type: 'security_rule' | 'parameter_update' | 'emergency_pause' | 'other';
    targetRule: string;
    proposedValue: string;
    quorum: number;
  };
  onChange: (field: string, value: string | number) => void;
}

export function ProposalFormFields({ formData, onChange }: ProposalFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="e.g., Increase Minimum Trust Score"
          className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the proposal and its impact..."
          rows={4}
          className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Type *</label>
        <select
          value={formData.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="security_rule">Security Rule</option>
          <option value="parameter_update">Parameter Update</option>
          <option value="emergency_pause">Emergency Pause</option>
          <option value="other">Other</option>
        </select>
      </div>

      {formData.type === 'security_rule' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Target Rule</label>
            <input
              type="text"
              value={formData.targetRule}
              onChange={(e) => onChange('targetRule', e.target.value)}
              placeholder="e.g., MIN_TRUST_SCORE"
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Proposed Value</label>
            <input
              type="text"
              value={formData.proposedValue}
              onChange={(e) => onChange('proposedValue', e.target.value)}
              placeholder="e.g., 75"
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Quorum *</label>
        <input
          type="number"
          required
          min="1"
          value={formData.quorum}
          onChange={(e) => onChange('quorum', parseInt(e.target.value) || 0)}
          placeholder="Minimum votes required"
          className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">Minimum number of votes required for proposal to pass</p>
      </div>
    </>
  );
}
