import { PIPELINE_STAGES } from '../constants/pipeline';
import type { Lead, LeadStage } from '../types/crm';

const LEGACY_STAGE_MAP: Record<string, LeadStage> = {
  New: 'New Lead',
  Contacted: 'Contracted',
  Qualified: 'Contracted',
  Proposal: 'Follow Up',
  Negotiation: 'Follow Up',
  Won: 'Converted',
  Lost: 'Follow Up',
};

export function normalizeLeadStage(stage: string): LeadStage {
  if (PIPELINE_STAGES.includes(stage as LeadStage)) {
    return stage as LeadStage;
  }
  return LEGACY_STAGE_MAP[stage] ?? 'New Lead';
}

export function migrateLeadStages(leads: Lead[]): Lead[] {
  return leads.map(lead => ({
    ...lead,
    stage: normalizeLeadStage(lead.stage),
  }));
}
