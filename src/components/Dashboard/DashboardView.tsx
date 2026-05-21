import React from 'react';
import { useCRM } from '../../context/CRMContext';
import type { DashboardFilter } from '../../types/crm';
import {
  buildMonthlyPipelineChart,
  getHighPriorityLeads,
  getPendingFollowUpLeads,
  pipelineGrowthPercent,
} from '../../utils/dashboardStats';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Briefcase,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

type KpiCardProps = {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose';
  onClick: () => void;
};

const accentStyles = {
  indigo: { blur: 'bg-indigo-500/5 group-hover:bg-indigo-500/10', icon: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  emerald: { blur: 'bg-emerald-500/5 group-hover:bg-emerald-500/10', icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  amber: { blur: 'bg-amber-500/5 group-hover:bg-amber-500/10', icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  rose: { blur: 'bg-rose-500/5 group-hover:bg-rose-500/10', icon: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, subtitle, icon, accent, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group text-left w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${accentStyles[accent].blur} rounded-full blur-2xl transition-all duration-300`} />
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-crm-textMuted">{label}</span>
      <div className={`p-2 rounded-xl border ${accentStyles[accent].icon}`}>{icon}</div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-extrabold text-slate-100 font-mono transition-all duration-300">{value}</h3>
      <p className="text-xs text-crm-textMuted mt-1">{subtitle}</p>
      <p className="text-[10px] text-indigo-400/80 mt-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        View on pipeline →
      </p>
    </div>
  </button>
);

const LeadMiniRow: React.FC<{
  lead: { id: string; company: string; name: string; value: number; stage: string; priority: string };
  onSelect: (id: string) => void;
  getPriorityStyle: (p: string) => string;
  getStageColor: (s: string) => string;
}> = ({ lead, onSelect, getPriorityStyle, getStageColor }) => (
  <div
    onClick={() => onSelect(lead.id)}
    className="p-3 rounded-xl bg-crm-bg/40 border border-crm-border/40 hover:bg-crm-cardHover hover:border-indigo-500/30 transition-all duration-200 cursor-pointer flex items-center justify-between group"
  >
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
        {lead.company}
      </span>
      <span className="text-[11px] text-crm-textMuted mt-0.5 truncate">
        {lead.name} · <span className={`px-1.5 rounded-full text-[9px] font-bold ${getPriorityStyle(lead.priority)}`}>{lead.priority}</span>
      </span>
    </div>
    <div className="flex flex-col items-end shrink-0 ml-2">
      <span className="text-sm font-extrabold text-slate-100 font-mono">${lead.value.toLocaleString()}</span>
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold mt-1 ${getStageColor(lead.stage)}`}>{lead.stage}</span>
    </div>
  </div>
);

export const DashboardView: React.FC = () => {
  const { leads, dashboardStats, navigateWithDashboardFilter, openViewLead, setActiveView } = useCRM();

  const monthlyTimeline = buildMonthlyPipelineChart(leads);
  const growthPercent = pipelineGrowthPercent(monthlyTimeline);
  const pendingFollowUpLeads = getPendingFollowUpLeads(leads).slice(0, 5);
  const highPriorityLeadList = getHighPriorityLeads(leads).slice(0, 5);

  const openFilter = (filter: DashboardFilter) => () => navigateWithDashboardFilter(filter);

  // Extract recent activities across all leads, sorted by timestamp
  const allActivities = leads
    .flatMap(lead => 
      lead.activities.map(act => ({
        ...act,
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><TrendingUp size={14} /></div>;
      case 'warning':
        return <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400"><Clock size={14} /></div>;
      case 'error':
        return <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400"><TrendingDown size={14} /></div>;
      case 'task':
        return <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"><Briefcase size={14} /></div>;
      default:
        return <div className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400"><AlertCircle size={14} /></div>;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead': return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
      case 'Contracted': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'Follow Up': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Converted': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-50 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Welcome Back, Operator
          </h2>
          <p className="text-crm-textMuted text-sm mt-1">
            Live metrics update as you manage leads across the pipeline.
          </p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Radio size={10} className="animate-pulse" />
            Live
          </span>
        </div>
        <button 
          onClick={() => setActiveView('pipeline')}
          className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-2 px-3 rounded-lg border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/10 shadow-glow-primary"
        >
          <span>Open Interactive Board</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* KPI Stats Cards — click to filter pipeline; auto-update via CRM context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Total Leads"
          value={dashboardStats.totalLeads}
          subtitle={`${dashboardStats.activeLeadsCount} active · ${leads.length - dashboardStats.activeLeadsCount} closed`}
          icon={<Users size={18} />}
          accent="indigo"
          onClick={openFilter('all')}
        />
        <KpiCard
          label="Converted Leads"
          value={dashboardStats.convertedLeads}
          subtitle={
            dashboardStats.totalLeads > 0
              ? `${Math.round((dashboardStats.convertedLeads / dashboardStats.totalLeads) * 100)}% conversion rate`
              : 'No leads yet'
          }
          icon={<CheckCircle2 size={18} />}
          accent="emerald"
          onClick={openFilter('converted')}
        />
        <KpiCard
          label="Pending Follow-ups"
          value={dashboardStats.pendingFollowUps}
          subtitle="leads in the Follow Up stage"
          icon={<Clock size={18} />}
          accent="amber"
          onClick={openFilter('follow-ups')}
        />
        <KpiCard
          label="High Priority Leads"
          value={dashboardStats.highPriorityLeads}
          subtitle="unresolved high-priority accounts"
          icon={<AlertCircle size={18} />}
          accent="rose"
          onClick={openFilter('high-priority')}
        />
      </div>

      {/* Attention queues — live lead lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-100">Pending Follow-ups</h4>
              <p className="text-xs text-crm-textMuted">Stale active deals needing outreach</p>
            </div>
            <button
              type="button"
              onClick={openFilter('follow-ups')}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300"
            >
              View all
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[220px] pr-1">
            {pendingFollowUpLeads.length > 0 ? (
              pendingFollowUpLeads.map(lead => (
                <LeadMiniRow
                  key={lead.id}
                  lead={lead}
                  onSelect={openViewLead}
                  getPriorityStyle={getPriorityStyle}
                  getStageColor={getStageColor}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-dashed border-crm-border/40 rounded-2xl">
                <p className="text-xs text-crm-textMuted">All active leads are up to date.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-100">High Priority Leads</h4>
              <p className="text-xs text-crm-textMuted">Critical accounts in the pipeline</p>
            </div>
            <button
              type="button"
              onClick={openFilter('high-priority')}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
            >
              View all
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[220px] pr-1">
            {highPriorityLeadList.length > 0 ? (
              highPriorityLeadList.map(lead => (
                <LeadMiniRow
                  key={lead.id}
                  lead={lead}
                  onSelect={openViewLead}
                  getPriorityStyle={getPriorityStyle}
                  getStageColor={getStageColor}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-dashed border-crm-border/40 rounded-2xl">
                <p className="text-xs text-crm-textMuted">No high-priority active leads.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics & High Value Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-100">Velocity Forecast</h4>
              <p className="text-xs text-crm-textMuted">Deal value added by month (from lead creation dates)</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold font-mono ${
              growthPercent >= 0
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {growthPercent >= 0 ? '+' : ''}{growthPercent}% vs last month
            </span>
          </div>
          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTimeline}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#131c2e', 
                    borderColor: '#1f2e4d', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Pipeline Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline snapshot */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-100">Pipeline Snapshot</h4>
            <p className="text-xs text-crm-textMuted">Live totals from your CRM data</p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center p-3 rounded-xl bg-crm-bg/40 border border-crm-border/40">
              <span className="text-xs text-crm-textMuted font-semibold">Active pipeline value</span>
              <span className="text-sm font-extrabold text-slate-100 font-mono">
                ${dashboardStats.activePipelineValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-crm-bg/40 border border-crm-border/40">
              <span className="text-xs text-crm-textMuted font-semibold">Converted revenue</span>
              <span className="text-sm font-extrabold text-emerald-300 font-mono">
                ${leads.filter(l => l.stage === 'Converted').reduce((s, l) => s + l.value, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-crm-bg/40 border border-crm-border/40">
              <span className="text-xs text-crm-textMuted font-semibold">Needs follow-up</span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">{dashboardStats.pendingFollowUps}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-crm-bg/40 border border-crm-border/40">
              <span className="text-xs text-crm-textMuted font-semibold">High priority active</span>
              <span className="text-sm font-extrabold text-rose-300 font-mono">{dashboardStats.highPriorityLeads}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline and Task Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-100">CRM Intelligence Feed</h4>
            <p className="text-xs text-crm-textMuted">Real-time audit trailing and sales representative activities</p>
          </div>
          <div className="space-y-4">
            {allActivities.length > 0 ? (
              allActivities.map((act) => (
                <div key={act.id} className="flex gap-4 items-start group">
                  {getActivityIcon(act.type)}
                  <div className="flex-1 border-b border-crm-border/30 pb-3 group-last:border-0 group-last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-200">
                        {act.text}
                      </p>
                      <span className="text-[10px] text-crm-textMuted font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-crm-textMuted mt-1">
                      Account: <span 
                        onClick={() => openViewLead(act.leadId)}
                        className="text-indigo-400 hover:underline cursor-pointer font-bold"
                      >
                        {act.company}
                      </span> ({act.leadName})
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-crm-textMuted">No recent actions recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Completion Statistics */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-100">Task Velocity</h4>
            <p className="text-xs text-crm-textMuted">Checks and requirements remaining to close deals</p>
          </div>
          
          {/* Progress Circle Visual */}
          {(() => {
            const allTasks = leads.flatMap(l => l.tasks);
            const completedTasks = allTasks.filter(t => t.completed);
            const totalTasksCount = allTasks.length;
            const completionPercent = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
            const pendingTasksCount = totalTasksCount - completedTasks.length;

            return (
              <div className="my-4 flex items-center justify-around gap-4 flex-1">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Background SVG for Progress Ring */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-crm-border/40"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500 transition-all duration-500 ease-out"
                      strokeWidth="3.5"
                      strokeDasharray={`${completionPercent}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-slate-100 font-mono">{completionPercent}%</span>
                    <span className="text-[8px] text-crm-textMuted uppercase font-semibold">Complete</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    <span className="text-xs text-slate-200 font-semibold">{completedTasks.length} Checked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-crm-border" />
                    <span className="text-xs text-slate-200 font-semibold">{pendingTasksCount} Pending</span>
                  </div>
                  <span className="text-[10px] text-crm-textMuted italic mt-1">
                    {pendingTasksCount} blocks before billing
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
