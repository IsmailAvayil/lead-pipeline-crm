import type { Lead, LeadPriority, LeadSource, LeadStage, DashboardFilter } from '../types/crm';
import { matchesDashboardFilter } from './dashboardStats';

export type FilterPriority = 'All' | LeadPriority;
export type FilterSource = 'All' | LeadSource;
export type FilterStage = 'All' | LeadStage;

export interface LeadListFilters {
  searchQuery: string;
  filterPriority: FilterPriority;
  filterSource: FilterSource;
  filterStage: FilterStage;
  dashboardFilter?: DashboardFilter;
}

export function filterLeads(leads: Lead[], filters: LeadListFilters): Lead[] {
  const q = filters.searchQuery.trim().toLowerCase();

  return leads.filter(lead => {
    const matchesSearch = !q || lead.name.toLowerCase().includes(q);
    const matchesPriority =
      filters.filterPriority === 'All' || lead.priority === filters.filterPriority;
    const matchesSource =
      filters.filterSource === 'All' || lead.source === filters.filterSource;
    const matchesStage =
      filters.filterStage === 'All' || lead.stage === filters.filterStage;
    const matchesDashboard =
      !filters.dashboardFilter ||
      filters.dashboardFilter === 'all' ||
      matchesDashboardFilter(lead, filters.dashboardFilter);

    return (
      matchesSearch && matchesPriority && matchesSource && matchesStage && matchesDashboard
    );
  });
}

export function hasActiveLeadFilters(filters: LeadListFilters): boolean {
  return (
    filters.searchQuery.trim().length > 0 ||
    filters.filterPriority !== 'All' ||
    filters.filterSource !== 'All' ||
    filters.filterStage !== 'All' ||
    (filters.dashboardFilter !== undefined && filters.dashboardFilter !== 'all')
  );
}
