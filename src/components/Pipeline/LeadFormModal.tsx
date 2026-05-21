import React, { useEffect, useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { DEFAULT_LEAD_STAGE, PIPELINE_STAGES } from '../../constants/pipeline';
import type { LeadModalMode, LeadPriority, LeadSource } from '../../types/crm';
import {
  validateLeadForm,
  type LeadFormValues,
  type LeadFieldErrors,
} from '../../utils/leadValidation';
import { AlertCircle, X, Pencil, Trash2 } from 'lucide-react';

const EMPTY_FORM: LeadFormValues = {
  name: '',
  company: '',
  phone: '',
  email: '',
  source: 'Website',
  assignedTo: '',
  priority: 'Medium',
  stage: DEFAULT_LEAD_STAGE,
  value: 0,
  confidence: 50,
  notes: '',
};

interface LeadFormModalProps {
  mode: LeadModalMode;
  leadId?: string;
  onClose: () => void;
  onRequestDelete?: (leadId: string) => void;
  onSwitchToEdit?: (leadId: string) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  mode,
  leadId,
  onClose,
  onRequestDelete,
  onSwitchToEdit,
}) => {
  const { leads, addLead, updateLead, findDuplicateByPhone } = useCRM();
  const lead = leadId ? leads.find(l => l.id === leadId) : undefined;

  const [values, setValues] = useState<LeadFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';

  useEffect(() => {
    setFieldErrors({});
    setFormError(null);
    if ((isEdit || isView) && lead) {
      setValues({
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        assignedTo: lead.assignedTo,
        priority: lead.priority,
        stage: lead.stage,
        value: lead.value,
        confidence: lead.confidence,
        notes: lead.notes,
      });
    } else if (isAdd) {
      setValues({ ...EMPTY_FORM, assignedTo: 'Alex Mercer' });
    }
  }, [mode, leadId, lead, isAdd, isEdit, isView]);

  if ((isEdit || isView) && !lead) {
    return (
      <ModalShell onClose={onClose} title="Lead not found">
        <div className="p-6 text-center">
          <p className="text-sm text-rose-300">This lead could not be found. It may have been deleted.</p>
          <button type="button" onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-crm-card border border-crm-border text-xs font-semibold">
            Close
          </button>
        </div>
      </ModalShell>
    );
  }

  const setField = <K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
    setFormError(null);
  };

  const checkPhoneDuplicate = (phone: string): string | undefined => {
    const dup = findDuplicateByPhone(phone, leadId);
    if (dup) return `Phone already used by ${dup.name}.`;
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;

    setFormError(null);
    const { valid, errors } = validateLeadForm(values);
    const phoneDupError = checkPhoneDuplicate(values.phone);
    if (phoneDupError) errors.phone = phoneDupError;

    if (!valid || phoneDupError) {
      setFieldErrors(errors);
      setFormError('Please fix the errors below before saving.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: values.name.trim(),
      company: values.company.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || `${values.name.trim().toLowerCase().replace(/\s+/g, '.')}@lead.local`,
      source: values.source as LeadSource,
      assignedTo: values.assignedTo.trim(),
      priority: values.priority,
      stage: values.stage,
      value: Number(values.value) || 0,
      confidence: Number(values.confidence) || 0,
      notes: values.notes.trim(),
    };

    const result = isAdd
      ? addLead(payload)
      : updateLead(leadId!, payload);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      if (result.fieldErrors) setFieldErrors(prev => ({ ...prev, ...result.fieldErrors }));
      return;
    }

    onClose();
  };

  const title = isAdd ? 'Add Lead' : isEdit ? 'Edit Lead' : 'Lead Details';

  const inputClass = (field: keyof LeadFormValues) =>
    `w-full bg-crm-bg border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-crm-textMuted/60 focus:outline-none transition-all ${
      fieldErrors[field]
        ? 'border-rose-500/60 focus:border-rose-500'
        : 'border-crm-border focus:border-indigo-500 focus:shadow-glow-primary'
    } ${isView ? 'opacity-90 cursor-default' : ''}`;

  return (
    <ModalShell onClose={onClose} title={title} subtitle={isView ? lead?.company : isAdd ? 'Create a new lead in the pipeline' : 'Update lead information'}>
      {formError && (
        <div className="mx-6 mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form id="lead-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Customer Name" required error={fieldErrors.name}>
            <input
              type="text"
              value={values.name}
              onChange={e => setField('name', e.target.value)}
              readOnly={isView}
              disabled={isSubmitting}
              className={inputClass('name')}
              placeholder="Full name"
            />
          </Field>
          <Field label="Company" error={fieldErrors.company}>
            <input
              type="text"
              value={values.company}
              onChange={e => setField('company', e.target.value)}
              readOnly={isView}
              disabled={isSubmitting}
              className={inputClass('company')}
              placeholder="Company name"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone Number" required error={fieldErrors.phone}>
            <input
              type="tel"
              value={values.phone}
              onChange={e => setField('phone', e.target.value)}
              onBlur={() => {
                const err = checkPhoneDuplicate(values.phone);
                if (err) setFieldErrors(prev => ({ ...prev, phone: err }));
              }}
              readOnly={isView}
              disabled={isSubmitting}
              className={inputClass('phone')}
              placeholder="+1 (555) 012-3456"
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={values.email}
              onChange={e => setField('email', e.target.value)}
              readOnly={isView}
              disabled={isSubmitting}
              className={inputClass('email')}
              placeholder="name@company.com"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Lead Source" required error={fieldErrors.source}>
            <select
              value={values.source}
              onChange={e => setField('source', e.target.value as LeadSource)}
              disabled={isView || isSubmitting}
              className={inputClass('source')}
            >
              <option value="">Select source</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Partner">Partner</option>
            </select>
          </Field>
          <Field label="Assigned Staff" required error={fieldErrors.assignedTo}>
            <input
              type="text"
              value={values.assignedTo}
              onChange={e => setField('assignedTo', e.target.value)}
              readOnly={isView}
              disabled={isSubmitting}
              className={inputClass('assignedTo')}
              placeholder="Staff member name"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Priority" required error={fieldErrors.priority}>
            <select
              value={values.priority}
              onChange={e => setField('priority', e.target.value as LeadPriority)}
              disabled={isView || isSubmitting}
              className={inputClass('priority')}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </Field>
          <Field label="Pipeline Stage" error={fieldErrors.stage}>
            <select
              value={values.stage}
              onChange={e => setField('stage', e.target.value as LeadFormValues['stage'])}
              disabled={isView || isSubmitting}
              className={inputClass('stage')}
            >
              {PIPELINE_STAGES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          {isView && lead && (
            <Field label="Create Date">
              <input
                type="text"
                readOnly
                value={new Date(lead.createdAt).toLocaleDateString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                className={inputClass('stage')}
              />
            </Field>
          )}
        </div>

        {!isView && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Deal Value ($)" error={fieldErrors.value}>
              <input
                type="number"
                min={0}
                value={values.value}
                onChange={e => setField('value', Number(e.target.value))}
                disabled={isSubmitting}
                className={inputClass('value')}
              />
            </Field>
            <Field label={`Confidence (${values.confidence}%)`} error={fieldErrors.confidence}>
              <input
                type="range"
                min={0}
                max={100}
                value={values.confidence}
                onChange={e => setField('confidence', Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full h-1.5 mt-3 accent-indigo-500"
              />
            </Field>
          </div>
        )}

        <Field label="Notes" error={fieldErrors.notes}>
          <textarea
            value={values.notes}
            onChange={e => setField('notes', e.target.value)}
            readOnly={isView}
            disabled={isSubmitting}
            rows={3}
            className={`${inputClass('notes')} resize-none`}
            placeholder="Additional notes..."
          />
        </Field>

        {isView && lead && (
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-crm-textMuted font-mono">
            <span>Created: {new Date(lead.createdAt).toLocaleString()}</span>
            <span>Last activity: {new Date(lead.lastActivityAt).toLocaleString()}</span>
          </div>
        )}
      </form>

      <div className="p-6 border-t border-crm-border/60 flex items-center justify-between gap-3 bg-crm-bg/40 rounded-b-2xl">
        <div>
          {isView && leadId && onRequestDelete && (
            <button
              type="button"
              onClick={() => onRequestDelete(leadId)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <Trash2 size={14} />
              Delete Lead
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-crm-border hover:bg-crm-card/50 text-xs font-semibold text-crm-textMuted hover:text-slate-100 transition-colors"
          >
            {isView ? 'Close' : 'Cancel'}
          </button>
          {isView && leadId && onSwitchToEdit && (
            <button
              type="button"
              onClick={() => onSwitchToEdit(leadId)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all"
            >
              <Pencil size={14} />
              Edit Lead
            </button>
          )}
          {!isView && (
            <button
              type="submit"
              form="lead-form"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-xs font-semibold text-white shadow-premium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Saving...' : isAdd ? 'Add Lead' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-crm-textMuted font-bold uppercase">
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[10px] text-rose-400 font-semibold">{error}</p>}
  </div>
);

const ModalShell: React.FC<{
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ onClose, title, subtitle, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-hidden />
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      className="relative w-full max-w-2xl bg-crm-sidebar border border-crm-border/60 shadow-premium rounded-2xl flex flex-col max-h-[90vh] z-10"
    >
      <div className="p-6 border-b border-crm-border/60 flex items-center justify-between shrink-0">
        <div>
          <h3 id="lead-modal-title" className="text-xl font-extrabold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-crm-textMuted mt-1">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-crm-textMuted hover:text-slate-100 hover:bg-crm-card/50 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);
