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

const inputClass = 'w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all';
const labelClass = 'block text-sm font-medium mb-2 text-white';

export function ProposalFormFields({ formData, onChange }: ProposalFormFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="e.g., Increase Minimum Trust Score"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the proposal and its impact..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Type *</label>
        <select
          value={formData.type}
          onChange={(e) => onChange('type', e.target.value)}
          className={inputClass}
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
            <label className={labelClass}>Target Rule</label>
            <input
              type="text"
              value={formData.targetRule}
              onChange={(e) => onChange('targetRule', e.target.value)}
              placeholder="e.g., MIN_TRUST_SCORE"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Proposed Value</label>
            <input
              type="text"
              value={formData.proposedValue}
              onChange={(e) => onChange('proposedValue', e.target.value)}
              placeholder="e.g., 75"
              className={inputClass}
            />
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Quorum *</label>
        <input
          type="number"
          required
          min="1"
          value={formData.quorum}
          onChange={(e) => onChange('quorum', parseInt(e.target.value) || 0)}
          placeholder="Minimum votes required"
          className={inputClass}
        />
        <p className="text-xs text-slate-400 mt-1">Minimum number of votes required for proposal to pass</p>
      </div>
    </>
  );
}
