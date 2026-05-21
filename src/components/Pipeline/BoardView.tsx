import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { PIPELINE_STAGES } from '../../constants/pipeline';
import type { LeadStage, Lead } from '../../types/crm';
import { DASHBOARD_FILTER_LABELS } from '../../utils/dashboardStats';
import { filterLeads, hasActiveLeadFilters } from '../../utils/leadFilters';
import { 
  Search, 
  Filter, 
  Phone,
  User,
  Calendar,
  Trash2, 
  Eye, 
  Pencil,
  Plus, 
  XCircle,
  Building2,
  Megaphone
} from 'lucide-react';

export const BoardView: React.FC = () => {
  const { 
    leads, 
    moveLeadStage, 
    openAddLead,
    openViewLead,
    openEditLead,
    openDeleteLead,
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterSource,
    setFilterSource,
    filterStage,
    setFilterStage,
    dashboardFilter,
    clearLeadFilters,
  } = useCRM();

  const [activeOverStage, setActiveOverStage] = useState<LeadStage | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  const listFilters = {
    searchQuery,
    filterPriority,
    filterSource,
    filterStage,
    dashboardFilter,
  };

  const filteredLeads = filterLeads(leads, listFilters);
  const filtersActive = hasActiveLeadFilters(listFilters);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingLeadId(leadId);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.45';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setActiveOverStage(null);
    setDraggingLeadId(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeOverStage !== stage) setActiveOverStage(stage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setActiveOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) moveLeadStage(leadId, targetStage);
    setActiveOverStage(null);
    setDraggingLeadId(null);
  };

  const getStageHeaderColor = (stage: LeadStage) => {
    switch (stage) {
      case 'New Lead': return 'from-slate-400 to-slate-500';
      case 'Contracted': return 'from-blue-400 to-blue-500';
      case 'Follow Up': return 'from-amber-400 to-amber-500';
      case 'Converted': return 'from-emerald-400 to-emerald-500';
      default: return 'from-indigo-400 to-indigo-500';
    }
  };

  const getPriorityBadgeStyle = (priority: Lead['priority']) => {
    switch (priority) {
      case 'High': return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
    }
  };

  const formatCreateDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 animate-fadeIn">
      <div className="p-6 border-b border-crm-border/60 bg-crm-sidebar/55 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-50">Lead Pipeline Board</h2>
            <p className="text-xs text-crm-textMuted mt-1">
              Search and filter leads, then drag cards between stages.
            </p>
          </div>
          <button
            onClick={openAddLead}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-glow-primary active:scale-95 text-xs font-bold shrink-0"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="relative flex-1 min-w-[200px]">
            <label className="text-[10px] text-crm-textMuted font-bold uppercase block mb-1.5">
              Search by customer name
            </label>
            <Search className="absolute left-3 bottom-2.5 text-crm-textMuted" size={16} />
            <input
              type="search"
              placeholder="Type customer name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full rounded-xl bg-crm-bg/70 border border-crm-border text-slate-100 placeholder-crm-textMuted/70 text-xs focus:outline-none focus:border-indigo-500 focus:shadow-glow-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <FilterSelect
              label="Lead source"
              value={filterSource}
              onChange={v => setFilterSource(v as Lead['source'] | 'All')}
              options={[
                { value: 'All', label: 'All sources' },
                { value: 'Website', label: 'Website' },
                { value: 'Referral', label: 'Referral' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Cold Outreach', label: 'Cold Outreach' },
                { value: 'Partner', label: 'Partner' },
              ]}
            />
            <FilterSelect
              label="Priority"
              value={filterPriority}
              onChange={v => setFilterPriority(v as Lead['priority'] | 'All')}
              options={[
                { value: 'All', label: 'All priorities' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
            <FilterSelect
              label="Lead status"
              value={filterStage}
              onChange={v => setFilterStage(v as LeadStage | 'All')}
              options={[
                { value: 'All', label: 'All statuses' },
                ...PIPELINE_STAGES.map(s => ({ value: s, label: s })),
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-xs text-crm-textMuted">
            Showing <span className="font-bold text-slate-200 font-mono">{filteredLeads.length}</span> of{' '}
            <span className="font-mono">{leads.length}</span> leads
            {dashboardFilter !== 'all' && (
              <span className="ml-2 text-indigo-300">
                · Dashboard: {DASHBOARD_FILTER_LABELS[dashboardFilter]}
              </span>
            )}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearLeadFilters}
              className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 hover:text-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-500/25 bg-indigo-500/5"
            >
              <XCircle size={12} />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-5 no-scrollbar items-stretch">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage);
          const isOver = activeOverStage === stage;

          return (
            <div 
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              className={`
                flex-shrink-0 w-[300px] rounded-2xl flex flex-col border transition-all duration-200 min-h-[400px]
                ${isOver 
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-glow-primary ring-2 ring-indigo-500/30' 
                  : 'border-crm-border/60 bg-crm-card/45'
                }
              `}
            >
              <div className="p-4 border-b border-crm-border/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${getStageHeaderColor(stage)}`} />
                  <h3 className="text-sm font-bold text-slate-100">{stage}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-crm-border/50 text-crm-textMuted font-mono font-bold ml-auto">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-260px)] min-h-[120px]">
                {stageLeads.length > 0 ? (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`
                        glass-panel p-4 rounded-xl cursor-grab active:cursor-grabbing
                        hover:border-indigo-500/40 hover:bg-crm-cardHover/70
                        group border-crm-border/40 bg-crm-card flex flex-col gap-3 transition-all duration-200 shadow-md
                        ${draggingLeadId === lead.id ? 'ring-2 ring-indigo-500/40' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={14} className="text-indigo-400 shrink-0" />
                          <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                            {lead.name}
                          </h4>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${getPriorityBadgeStyle(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>

                      {lead.company && (
                        <p className="text-[10px] text-crm-textMuted flex items-center gap-1 truncate -mt-1">
                          <Building2 size={10} />
                          {lead.company}
                        </p>
                      )}

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-2 text-crm-textMuted">
                          <Phone size={12} className="shrink-0 text-slate-400" />
                          <span className="text-slate-200 font-medium">{lead.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-crm-textMuted">
                          <Megaphone size={12} className="shrink-0 text-slate-400" />
                          <span className="text-slate-200">{lead.source}</span>
                        </div>
                        <div className="flex items-center gap-2 text-crm-textMuted">
                          <User size={12} className="shrink-0 text-slate-400" />
                          <span className="text-slate-200 truncate">{lead.assignedTo || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-crm-textMuted">
                          <Calendar size={12} className="shrink-0 text-slate-400" />
                          <span className="text-slate-200 font-mono">{formatCreateDate(lead.createdAt)}</span>
                        </div>
                      </div>

                      <div className="border-t border-crm-border/40 pt-2 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewLead(lead.id);
                          }}
                          title="View lead details"
                          className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-crm-textMuted hover:text-indigo-400 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditLead(lead.id);
                          }}
                          title="Edit lead"
                          className="p-1.5 rounded-lg hover:bg-violet-500/10 text-crm-textMuted hover:text-violet-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteLead(lead.id);
                          }}
                          title="Delete lead"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-crm-textMuted hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div 
                    className={`flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-2xl min-h-[100px] transition-colors ${
                      isOver ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-crm-border/30'
                    }`}
                  >
                    <p className="text-[10px] text-crm-textMuted">
                      {isOver ? 'Drop lead here' : 'No leads in this stage'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="min-w-[140px]">
    <label className="text-[10px] text-crm-textMuted font-bold uppercase block mb-1.5">{label}</label>
    <div className="flex items-center gap-1.5 bg-crm-bg/50 border border-crm-border px-3 py-2 rounded-xl">
      <Filter size={12} className="text-crm-textMuted shrink-0" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer w-full"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-crm-card">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);
