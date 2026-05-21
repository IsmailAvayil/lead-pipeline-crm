import type { LeadStage } from '../types/crm';

export const PIPELINE_STAGES: LeadStage[] = [
  'New Lead',
  'Contracted',
  'Follow Up',
  'Converted',
];

export const DEFAULT_LEAD_STAGE: LeadStage = 'New Lead';
