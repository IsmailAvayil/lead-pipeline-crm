import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface DeleteLeadModalProps {
  leadId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({ leadId, onClose, onDeleted }) => {
  const { leads, deleteLead } = useCRM();
  const lead = leads.find(l => l.id === leadId);

  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!lead) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        <div className="relative bg-crm-sidebar border border-crm-border rounded-2xl p-6 max-w-md w-full z-10">
          <p className="text-sm text-rose-300">Lead not found. It may have already been deleted.</p>
          <button type="button" onClick={onClose} className="mt-4 w-full py-2 rounded-xl border border-crm-border text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setError(null);
    setIsDeleting(true);
    const result = deleteLead(leadId);
    setIsDeleting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onDeleted?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-crm-sidebar border border-crm-border/60 shadow-premium rounded-2xl z-10"
      >
        <div className="p-6 border-b border-crm-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-100">Delete Lead</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-crm-textMuted hover:text-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <p className="text-sm text-slate-200">
            Are you sure you want to delete <strong className="text-slate-50">{lead.name}</strong>
            {lead.company ? ` (${lead.company})` : ''}? This action cannot be undone.
          </p>
          <p className="text-xs text-crm-textMuted font-mono">Phone: {lead.phone}</p>
        </div>

        <div className="p-6 border-t border-crm-border/60 flex justify-end gap-3 bg-crm-bg/40 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-crm-border text-xs font-semibold text-crm-textMuted hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};
