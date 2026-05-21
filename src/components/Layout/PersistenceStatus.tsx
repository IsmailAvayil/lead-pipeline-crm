import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { Database, AlertCircle, Loader2 } from 'lucide-react';

export const PersistenceStatus: React.FC = () => {
  const { isHydrating, persistError, lastSavedAt } = useCRM();

  if (isHydrating) {
    return (
      <div className="mx-4 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-bg/60 border border-crm-border/30 text-[10px] text-crm-textMuted">
        <Loader2 size={12} className="animate-spin text-indigo-400" />
        <span>Loading saved leads...</span>
      </div>
    );
  }

  if (persistError) {
    return (
      <div className="mx-4 mb-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300">
        <AlertCircle size={12} className="shrink-0 mt-0.5" />
        <span>{persistError}</span>
      </div>
    );
  }

  return (
    <div
      className="mx-4 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-emerald-400/90"
      title={lastSavedAt ? `Last saved: ${new Date(lastSavedAt).toLocaleString()}` : 'Data stored in this browser'}
    >
      <Database size={12} />
      <span>Saved locally — data persists after refresh</span>
    </div>
  );
};
