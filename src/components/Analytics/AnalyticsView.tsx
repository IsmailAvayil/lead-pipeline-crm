import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { PIPELINE_STAGES } from '../../constants/pipeline';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  Award, 
  AlertTriangle,
  Flame,
  Milestone
} from 'lucide-react';

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];

export const AnalyticsView: React.FC = () => {
  const { leads, dashboardStats, theme } = useCRM();

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#131c2e' : '#ffffff',
    borderColor: theme === 'dark' ? '#1f2e4d' : '#cbd5e1',
    borderRadius: '12px',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  };

  const tooltipLabelStyle = {
    color: theme === 'dark' ? '#94a3b8' : '#475569',
  };

  // 1. Data Prep for Pipeline Stage Value (Bar Chart)
  const stageData = PIPELINE_STAGES.map(stage => {
    const leadsInStage = leads.filter(l => l.stage === stage);
    const value = leadsInStage.reduce((sum, l) => sum + l.value, 0);
    const count = leadsInStage.length;
    return { name: stage, value, count };
  });

  // 2. Data Prep for Lead Sources (Donut Chart)
  const sources: Record<string, { count: number; value: number }> = {};
  leads.forEach(lead => {
    if (!sources[lead.source]) {
      sources[lead.source] = { count: 0, value: 0 };
    }
    sources[lead.source].count += 1;
    sources[lead.source].value += lead.value;
  });
  
  const sourceData = Object.entries(sources).map(([name, data]) => ({
    name,
    value: data.count,
    amount: data.value
  }));

  const funnelData = PIPELINE_STAGES.map((stage, index) => ({
    stage,
    count: leads.filter(l => PIPELINE_STAGES.indexOf(l.stage) >= index).length,
  }));

  const wonLeads = leads.filter(l => l.stage === 'Converted');
  const totalValueWon = wonLeads.reduce((sum, l) => sum + l.value, 0);
  const activeLeads = leads.filter(l => l.stage !== 'Converted');
  
  // High confidence deals count (> 75%)
  const highConfidenceCount = activeLeads.filter(l => l.confidence >= 75).length;
  const highConfidenceValue = activeLeads.filter(l => l.confidence >= 75).reduce((sum, l) => sum + l.value, 0);

  // Average confidence score across active deals
  const avgConfidence = activeLeads.length > 0 
    ? Math.round(activeLeads.reduce((sum, l) => sum + l.confidence, 0) / activeLeads.length) 
    : 0;

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-50">Intelligence Analytics</h2>
        <p className="text-xs text-crm-textMuted mt-1">Deep visual analytics, deal distribution reports, and historical performance tracking.</p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] text-crm-textMuted font-bold uppercase tracking-wider block">Closed Revenues</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">${totalValueWon.toLocaleString()}</span>
            <span className="text-[9px] text-crm-textMuted block mt-0.5">from {wonLeads.length} successful contracts</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Flame size={20} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="text-[10px] text-crm-textMuted font-bold uppercase tracking-wider block">High Confidence pipeline</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">${highConfidenceValue.toLocaleString()}</span>
            <span className="text-[9px] text-crm-textMuted block mt-0.5">{highConfidenceCount} deals above 75% confidence</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Milestone size={20} />
          </div>
          <div>
            <span className="text-[10px] text-crm-textMuted font-bold uppercase tracking-wider block">Average Confidence</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">{avgConfidence}%</span>
            <span className="text-[9px] text-crm-textMuted block mt-0.5">across active deal representatives</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-crm-textMuted font-bold uppercase tracking-wider block">Pending Follow-ups</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">{dashboardStats.pendingFollowUps}</span>
            <span className="text-[9px] text-crm-textMuted block mt-0.5">stale active deals (3+ days)</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution Value Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-indigo-400" />
            <div>
              <h4 className="text-base font-bold text-slate-100">Deal Stage Allocations</h4>
              <p className="text-xs text-crm-textMuted">Cumulative cash valuation allocated per sales stage</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#64748b' : '#475569'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#64748b' : '#475569'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: any, _name: any, props: any) => [
                    `$${value.toLocaleString()} (${props.payload.count} deals)`, 
                    'Value'
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Origins Donut Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-indigo-400" />
            <div>
              <h4 className="text-base font-bold text-slate-100">Lead Source Channels</h4>
              <p className="text-xs text-crm-textMuted">Proportion of contracts incoming from primary funnels</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} contracts ($${props.payload.amount.toLocaleString()})`, 
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: theme === 'dark' ? '#94a3b8' : '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-crm-textMuted">No source channel data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Funnel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-400" />
            <div>
              <h4 className="text-base font-bold text-slate-100">Conversion Funnel Dropoff</h4>
              <p className="text-xs text-crm-textMuted">Lead conversion progression count at each critical sales milestone</p>
            </div>
          </div>
          
          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" stroke={theme === 'dark' ? '#64748b' : '#475569'} fontSize={11} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" stroke={theme === 'dark' ? '#64748b' : '#475569'} fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: any) => [`${value} Accounts`, 'Reached Milestone']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  fillOpacity={0.15} 
                  fill="#8b5cf6" 
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intel Briefing Alert Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-100">CRM Analyst Advice</h4>
            <p className="text-xs text-crm-textMuted">Algorithmic advisory suggestions to optimize close velocities</p>
          </div>
          
          <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
            {/* Advice Item 1 */}
            <div className="flex gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <Flame size={18} className="text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-slate-200">
                <strong>Follow-up queue:</strong> You have {leads.filter(l => l.stage === 'Follow Up').length} leads in Follow Up. Prioritize outreach to move them toward conversion.
              </p>
            </div>

            {/* Advice Item 2 */}
            {(() => {
              const websiteLeads = leads.filter(l => l.source === 'Website');
              const referralLeads = leads.filter(l => l.source === 'Referral');
              const bestChannel = websiteLeads.reduce((a, b) => a + b.value, 0) > referralLeads.reduce((a, b) => a + b.value, 0) ? 'Direct Website' : 'Client Referrals';
              return (
                <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <TrendingUp size={18} className="text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-slate-200">
                    <strong>Lead Gen Focus:</strong> <strong>{bestChannel}</strong> represents your highest cumulative deal valuation. Align marketing assets to reinforce this funnel.
                  </p>
                </div>
              );
            })()}

            {/* Advice Item 3 */}
            {leads.filter(l => l.stage === 'New Lead' && l.priority === 'High').length > 0 && (
              <div className="flex gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
                <p className="text-xs text-slate-200">
                  <strong>High Priority Inbounds:</strong> {leads.filter(l => l.stage === 'New Lead' && l.priority === 'High').length} high-priority new leads need first contact. Engage immediately!
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-crm-textMuted font-semibold text-center uppercase tracking-wider pt-2 border-t border-crm-border/30">
            Analytics Engine Sync: Online
          </div>
        </div>
      </div>
    </div>
  );
};
