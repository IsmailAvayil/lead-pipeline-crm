import type { CRMStats, DashboardFilter, Lead } from '../types/crm';

export const FOLLOW_UP_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type DashboardStats = CRMStats & {
  activePipelineValue: number;
  activeLeadsCount: number;
};

export const DASHBOARD_FILTER_LABELS: Record<DashboardFilter, string> = {
  all: 'All Leads',
  converted: 'Converted',
  'follow-ups': 'Follow Up',
  'high-priority': 'High Priority',
};

export function isConverted(lead: Lead): boolean {
  return lead.stage === 'Converted';
}

export function isActiveLead(lead: Lead): boolean {
  return lead.stage !== 'Converted';
}

export function isPendingFollowUp(lead: Lead): boolean {
  return lead.stage === 'Follow Up';
}

export function matchesDashboardFilter(lead: Lead, filter: DashboardFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'converted':
      return isConverted(lead);
    case 'follow-ups':
      return lead.stage === 'Follow Up';
    case 'high-priority':
      return lead.priority === 'High' && isActiveLead(lead);
    default:
      return true;
  }
}

export function computeDashboardStats(leads: Lead[]): DashboardStats {
  const activeLeads = leads.filter(isActiveLead);
  const convertedLeads = leads.filter(isConverted);
  const pendingFollowUps = leads.filter(isPendingFollowUp);
  const highPriorityLeads = activeLeads.filter(l => l.priority === 'High');

  return {
    totalLeads: leads.length,
    convertedLeads: convertedLeads.length,
    pendingFollowUps: pendingFollowUps.length,
    highPriorityLeads: highPriorityLeads.length,
    activePipelineValue: activeLeads.reduce((sum, l) => sum + l.value, 0),
    activeLeadsCount: activeLeads.length,
  };
}

export function getHighPriorityLeads(leads: Lead[]): Lead[] {
  return leads
    .filter(l => l.priority === 'High' && isActiveLead(l))
    .sort((a, b) => b.value - a.value);
}

export function getPendingFollowUpLeads(leads: Lead[]): Lead[] {
  return leads
    .filter(isPendingFollowUp)
    .sort((a, b) => new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime());
}

export function buildMonthlyPipelineChart(leads: Lead[]): { name: string; value: number }[] {
  const now = new Date();
  const points: { name: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const value = leads
      .filter(l => {
        const created = new Date(l.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      })
      .reduce((sum, l) => sum + l.value, 0);
    points.push({ name: MONTH_LABELS[month], value });
  }

  return points;
}

export function pipelineGrowthPercent(chartData: { value: number }[]): number {
  if (chartData.length < 2) return 0;
  const prev = chartData[chartData.length - 2].value;
  const curr = chartData[chartData.length - 1].value;
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}
