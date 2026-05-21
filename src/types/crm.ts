export type LeadStage = 'New Lead' | 'Contracted' | 'Follow Up' | 'Converted';

export type LeadPriority = 'Low' | 'Medium' | 'High';

export type LeadSource = 'Website' | 'Referral' | 'LinkedIn' | 'Cold Outreach' | 'Partner';

export type LeadModalMode = 'add' | 'edit' | 'view';

export type LeadOperationResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  text: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task';
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: LeadStage;
  priority: LeadPriority;
  confidence: number; // 0 to 100
  source: LeadSource;
  notes: string;
  tasks: Task[];
  activities: Activity[];
  createdAt: string;
  lastActivityAt: string;
  assignedTo: string;
}

export type DashboardFilter = 'all' | 'converted' | 'follow-ups' | 'high-priority';

export interface CRMStats {
  totalLeads: number;
  convertedLeads: number;
  pendingFollowUps: number;
  highPriorityLeads: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number; // duration in ms, default is 4000
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UndoAction {
  type: 'stage_move' | 'lead_delete' | 'lead_add' | 'lead_update';
  leadId: string;
  snapshot: any; // Saves the previous state of the lead (or stage name)
  description: string;
}

