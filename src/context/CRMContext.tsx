import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Lead,
  LeadStage,
  LeadPriority,
  LeadSource,
  Task,
  Activity,
  DashboardFilter,
  LeadModalMode,
  LeadOperationResult,
  Toast,
  UndoAction,
} from '../types/crm';
import { phonesMatch } from '../utils/leadValidation';
import { computeDashboardStats, type DashboardStats } from '../utils/dashboardStats';
import { migrateLeadStages } from '../utils/migrateStages';
import { leadsApi } from '../api/leadsApi';
import { STORAGE_KEYS } from '../services/leadStorage';
import type { StorageResult } from '../services/leadStorage';

interface CRMContextType {
  leads: Lead[];
  isHydrating: boolean;
  persistError: string | null;
  lastSavedAt: string | null;
  dashboardStats: DashboardStats;
  dashboardFilter: DashboardFilter;
  setDashboardFilter: (filter: DashboardFilter) => void;
  navigateWithDashboardFilter: (filter: DashboardFilter) => void;
  activeView: 'dashboard' | 'pipeline' | 'analytics';
  setActiveView: (view: 'dashboard' | 'pipeline' | 'analytics') => void;
  leadModal: { mode: LeadModalMode; leadId?: string } | null;
  deleteModalLeadId: string | null;
  openAddLead: () => void;
  openEditLead: (leadId: string) => void;
  openViewLead: (leadId: string) => void;
  openDeleteLead: (leadId: string) => void;
  closeLeadModal: () => void;
  closeDeleteModal: () => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPriority: 'All' | LeadPriority;
  setFilterPriority: (priority: 'All' | LeadPriority) => void;
  filterSource: 'All' | LeadSource;
  setFilterSource: (source: 'All' | LeadSource) => void;
  filterStage: 'All' | LeadStage;
  setFilterStage: (stage: 'All' | LeadStage) => void;
  clearLeadFilters: () => void;
  
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivityAt' | 'activities' | 'tasks'> & { tasks?: string[] }) => LeadOperationResult;
  updateLead: (leadId: string, updates: Partial<Lead>) => LeadOperationResult;
  deleteLead: (leadId: string) => LeadOperationResult;
  findDuplicateByPhone: (phone: string, excludeLeadId?: string) => Lead | undefined;
  moveLeadStage: (leadId: string, newStage: LeadStage) => void;
  addTask: (leadId: string, title: string) => void;
  toggleTask: (leadId: string, taskId: string) => void;
  deleteTask: (leadId: string, taskId: string) => void;
  addActivity: (leadId: string, text: string, type: Activity['type']) => void;
  exportData: () => void;
  importData: (data: string) => boolean;

  // Bonus Features State
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], action?: Toast['action'], duration?: number) => void;
  removeToast: (id: string) => void;
  undoLastAction: () => void;
  hasUndo: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => leadsApi.hydrate());
  const [isHydrating, setIsHydrating] = useState(true);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    () => leadsApi.getMeta()?.updatedAt ?? null
  );
  const [activeView, setActiveView] = useState<'dashboard' | 'pipeline' | 'analytics'>('dashboard');
  const [leadModal, setLeadModal] = useState<{ mode: LeadModalMode; leadId?: string } | null>(null);
  const [deleteModalLeadId, setDeleteModalLeadId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Bonus State Definitions
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('crm_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('crm_theme', next);
      return next;
    });
  };

  const showToast = (message: string, type: Toast['type'], action?: Toast['action'], duration = 4000) => {
    const id = `toast-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type, action, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const pushToUndo = (action: UndoAction) => {
    setUndoStack(prev => {
      const next = [action, ...prev];
      if (next.length > 10) next.pop();
      return next;
    });
  };

  const hasUndo = undoStack.length > 0;

  // Set visual body class list based on theme
  useEffect(() => {
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
  }, [theme]);

  const findDuplicateByPhone = (phone: string, excludeLeadId?: string): Lead | undefined =>
    leads.find(l => l.id !== excludeLeadId && phonesMatch(l.phone, phone));

  const openAddLead = () => setLeadModal({ mode: 'add' });
  const openEditLead = (leadId: string) => setLeadModal({ mode: 'edit', leadId });
  const openViewLead = (leadId: string) => setLeadModal({ mode: 'view', leadId });
  const openDeleteLead = (leadId: string) => setDeleteModalLeadId(leadId);
  const closeLeadModal = () => setLeadModal(null);
  const closeDeleteModal = () => setDeleteModalLeadId(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'All' | LeadPriority>('All');
  const [filterSource, setFilterSource] = useState<'All' | LeadSource>('All');
  const [filterStage, setFilterStage] = useState<'All' | LeadStage>('All');
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilter>('all');
  const [statsTick, setStatsTick] = useState(0);

  const clearLeadFilters = () => {
    setSearchQuery('');
    setFilterPriority('All');
    setFilterSource('All');
    setFilterStage('All');
    setDashboardFilter('all');
  };

  const navigateWithDashboardFilter = (filter: DashboardFilter) => {
    setDashboardFilter(filter);
    if (filter === 'high-priority') {
      setFilterPriority('High');
      setFilterStage('All');
    } else if (filter === 'converted') {
      setFilterStage('Converted');
      setFilterPriority('All');
    } else if (filter === 'follow-ups') {
      setFilterStage('Follow Up');
      setFilterPriority('All');
    } else {
      setFilterPriority('All');
      setFilterStage('All');
    }
    setActiveView('pipeline');
  };

  const dashboardStats = useMemo(
    () => computeDashboardStats(leads),
    [leads, statsTick]
  );

  // Refresh time-based metrics (pending follow-ups) every minute
  useEffect(() => {
    const interval = setInterval(() => setStatsTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Re-sync from mock API / localStorage on mount (validates stored data)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leadsApi.getAll();
        if (!cancelled) {
          setLeads(data);
          setLastSavedAt(leadsApi.getMeta()?.updatedAt ?? null);
          setPersistError(null);
        }
      } catch {
        if (!cancelled) {
          setPersistError('Failed to load saved leads. Using cached data.');
        }
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync when another browser tab updates localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEYS.leads || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          setLeads(migrateLeadStages(parsed));
          setLastSavedAt(leadsApi.getMeta()?.updatedAt ?? null);
          setPersistError(null);
        }
      } catch {
        /* ignore invalid cross-tab payload */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const saveLeads = (updatedLeads: Lead[]): StorageResult => {
    const result = leadsApi.persist(updatedLeads);
    if (result.success) {
      setLeads(updatedLeads);
      setPersistError(null);
      setLastSavedAt(new Date().toISOString());
    } else {
      setPersistError(result.error);
    }
    return result;
  };

  const undoLastAction = () => {
    if (undoStack.length === 0) return;
    const [action, ...remaining] = undoStack;
    setUndoStack(remaining);

    if (action.type === 'stage_move') {
      const targetLead = leads.find(l => l.id === action.leadId);
      if (!targetLead) return;
      const originalStage = action.snapshot.stage;
      const updated = leads.map(l => {
        if (l.id === action.leadId) {
          const now = new Date().toISOString();
          const activityText = `Action undone: Shifted status back to ${originalStage}`;
          return {
            ...l,
            stage: originalStage as LeadStage,
            lastActivityAt: now,
            activities: [
              {
                id: Math.random().toString(36).substring(2, 9),
                text: activityText,
                timestamp: now,
                type: 'info' as const
              },
              ...l.activities
            ]
          };
        }
        return l;
      });
      saveLeads(updated);
      showToast(`Undone: Moved "${targetLead.name}" back to ${originalStage}`, 'info');
    } else if (action.type === 'lead_delete') {
      const restoredLead = action.snapshot as Lead;
      const updated = [restoredLead, ...leads];
      saveLeads(updated);
      showToast(`Undone: Restored lead "${restoredLead.name}"`, 'success');
    } else if (action.type === 'lead_add') {
      const targetLead = leads.find(l => l.id === action.leadId);
      const updated = leads.filter(l => l.id !== action.leadId);
      saveLeads(updated);
      showToast(`Undone: Removed added lead "${targetLead?.name || ''}"`, 'info');
    } else if (action.type === 'lead_update') {
      const targetLead = leads.find(l => l.id === action.leadId);
      const previousLead = action.snapshot as Lead;
      const updated = leads.map(l => {
        if (l.id === action.leadId) {
          return previousLead;
        }
        return l;
      });
      saveLeads(updated);
      showToast(`Undone: Restored changes for "${targetLead?.name || ''}"`, 'info');
    }
  };

  const addLead = (
    newLeadData: Omit<Lead, 'id' | 'createdAt' | 'lastActivityAt' | 'activities' | 'tasks'> & { tasks?: string[] }
  ): LeadOperationResult => {
    const duplicate = findDuplicateByPhone(newLeadData.phone);
    if (duplicate) {
      return {
        success: false,
        error: `This phone number is already registered to ${duplicate.name}.`,
        fieldErrors: { phone: 'Duplicate phone number is not allowed.' },
      };
    }

    const leadId = `lead-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    const initialTasks: Task[] = (newLeadData.tasks || []).map(t => ({
      id: Math.random().toString(36).substring(2, 9),
      title: t,
      completed: false
    }));

    const initialActivities: Activity[] = [
      {
        id: Math.random().toString(36).substring(2, 9),
        text: `Lead created for ${newLeadData.company} (${newLeadData.name})`,
        timestamp: now,
        type: 'info' as const
      }
    ];

    const lead: Lead = {
      ...newLeadData,
      id: leadId,
      createdAt: now,
      lastActivityAt: now,
      tasks: initialTasks,
      activities: initialActivities
    };

    const saved = saveLeads([lead, ...leads]);
    if (!saved.success) {
      return { success: false, error: saved.error };
    }

    pushToUndo({
      type: 'lead_add',
      leadId: lead.id,
      snapshot: null,
      description: `Add lead "${lead.name}"`
    });
    showToast(`Created lead "${lead.name}"`, 'success', {
      label: 'Undo',
      onClick: undoLastAction
    });

    return { success: true };
  };

  const updateLead = (leadId: string, updates: Partial<Lead>): LeadOperationResult => {
    const existing = leads.find(l => l.id === leadId);
    if (!existing) {
      return { success: false, error: 'Lead not found. It may have been deleted.' };
    }

    if (updates.phone !== undefined) {
      const duplicate = findDuplicateByPhone(updates.phone, leadId);
      if (duplicate) {
        return {
          success: false,
          error: `This phone number is already registered to ${duplicate.name}.`,
          fieldErrors: { phone: 'Duplicate phone number is not allowed.' },
        };
      }
    }

    const previousLead = { ...existing };
    const now = new Date().toISOString();
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        const changes: string[] = [];
        if (updates.name && updates.name !== lead.name) changes.push(`Name updated to "${updates.name}"`);
        if (updates.company && updates.company !== lead.company) changes.push(`Company updated to "${updates.company}"`);
        if (updates.value !== undefined && updates.value !== lead.value) changes.push(`Deal value updated to $${updates.value.toLocaleString()}`);
        if (updates.priority && updates.priority !== lead.priority) changes.push(`Priority changed to ${updates.priority}`);
        if (updates.confidence !== undefined && updates.confidence !== lead.confidence) changes.push(`Confidence updated to ${updates.confidence}%`);
        if (updates.stage && updates.stage !== lead.stage) changes.push(`Moved stage from ${lead.stage} to ${updates.stage}`);
        if (updates.phone && updates.phone !== lead.phone) changes.push(`Phone updated to ${updates.phone}`);
        if (updates.source && updates.source !== lead.source) changes.push(`Source updated to ${updates.source}`);
        if (updates.assignedTo && updates.assignedTo !== lead.assignedTo) changes.push(`Assigned to ${updates.assignedTo}`);

        const newActivities: Activity[] = [...lead.activities];
        if (changes.length > 0) {
          newActivities.unshift({
            id: Math.random().toString(36).substring(2, 9),
            text: changes.join(', '),
            timestamp: now,
            type: (updates.stage ? 'warning' : 'info') as Activity['type']
          });
        }

        return {
          ...lead,
          ...updates,
          lastActivityAt: now,
          activities: newActivities
        };
      }
      return lead;
    });
    const saved = saveLeads(updated);
    if (!saved.success) {
      return { success: false, error: saved.error };
    }

    pushToUndo({
      type: 'lead_update',
      leadId: leadId,
      snapshot: previousLead,
      description: `Update lead "${existing.name}"`
    });
    showToast(`Updated lead "${existing.name}"`, 'success', {
      label: 'Undo',
      onClick: undoLastAction
    });

    return { success: true };
  };

  const deleteLead = (leadId: string): LeadOperationResult => {
    const existing = leads.find(l => l.id === leadId);
    if (!existing) {
      return { success: false, error: 'Lead not found. It may have already been deleted.' };
    }
    if (selectedLeadId === leadId) setSelectedLeadId(null);
    if (leadModal?.leadId === leadId) closeLeadModal();
    if (deleteModalLeadId === leadId) closeDeleteModal();
    const saved = saveLeads(leads.filter(lead => lead.id !== leadId));
    if (!saved.success) {
      return { success: false, error: saved.error };
    }

    pushToUndo({
      type: 'lead_delete',
      leadId: leadId,
      snapshot: existing,
      description: `Delete lead "${existing.name}"`
    });
    showToast(`Deleted lead "${existing.name}"`, 'warning', {
      label: 'Undo',
      onClick: undoLastAction
    });

    return { success: true };
  };

  const moveLeadStage = (leadId: string, newStage: LeadStage) => {
    const existing = leads.find(l => l.id === leadId);
    if (!existing || existing.stage === newStage) return;

    const now = new Date().toISOString();
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        let type: Activity['type'] = 'info';
        if (newStage === 'Converted') type = 'success';
        if (newStage === 'Follow Up') type = 'warning';
        if (newStage === 'Contracted') type = 'info';

        const activityText = `Pipeline status shifted: ${lead.stage} → ${newStage}`;
        const newActivities: Activity[] = [
          {
            id: Math.random().toString(36).substring(2, 9),
            text: activityText,
            timestamp: now,
            type
          },
          ...lead.activities
        ];

        return {
          ...lead,
          stage: newStage,
          lastActivityAt: now,
          activities: newActivities
        };
      }
      return lead;
    });

    saveLeads(updated);

    pushToUndo({
      type: 'stage_move',
      leadId: leadId,
      snapshot: { stage: existing.stage },
      description: `Move "${existing.name}" to ${newStage}`
    });
    showToast(`Moved "${existing.name}" to ${newStage}`, 'info', {
      label: 'Undo',
      onClick: undoLastAction
    });
  };

  const addTask = (leadId: string, title: string) => {
    const now = new Date().toISOString();
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        const newTask: Task = {
          id: Math.random().toString(36).substring(2, 9),
          title,
          completed: false
        };
        const newActivities: Activity[] = [
          {
            id: Math.random().toString(36).substring(2, 9),
            text: `Added checklist task: "${title}"`,
            timestamp: now,
            type: 'task' as const
          },
          ...lead.activities
        ];
        return {
          ...lead,
          tasks: [...lead.tasks, newTask],
          lastActivityAt: now,
          activities: newActivities
        };
      }
      return lead;
    });
    saveLeads(updated);
    showToast(`Task added: "${title}"`, 'success');
  };

  const toggleTask = (leadId: string, taskId: string) => {
    const now = new Date().toISOString();
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        let taskTitle = '';
        let wasCompleted = false;
        
        const tasks = lead.tasks.map(t => {
          if (t.id === taskId) {
            taskTitle = t.title;
            wasCompleted = !t.completed;
            return { ...t, completed: wasCompleted };
          }
          return t;
        });

        const newActivities: Activity[] = [
          {
            id: Math.random().toString(36).substring(2, 9),
            text: `Task "${taskTitle}" marked as ${wasCompleted ? 'completed' : 'incomplete'}`,
            timestamp: now,
            type: (wasCompleted ? 'success' : 'info') as Activity['type']
          },
          ...lead.activities
        ];

        return {
          ...lead,
          tasks,
          lastActivityAt: now,
          activities: newActivities
        };
      }
      return lead;
    });
    saveLeads(updated);
    showToast('Checklist task updated', 'info');
  };

  const deleteTask = (leadId: string, taskId: string) => {
    const now = new Date().toISOString();
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        const targetTask = lead.tasks.find(t => t.id === taskId);
        const newActivities: Activity[] = [
          {
            id: Math.random().toString(36).substring(2, 9),
            text: `Deleted task: "${targetTask?.title || 'Unknown'}"`,
            timestamp: now,
            type: 'info' as const
          },
          ...lead.activities
        ];
        return {
          ...lead,
          tasks: lead.tasks.filter(t => t.id !== taskId),
          lastActivityAt: now,
          activities: newActivities
        };
      }
      return lead;
    });
    saveLeads(updated);
    showToast('Task deleted from checklist', 'warning');
  };

  const addActivity = (leadId: string, text: string, type: Activity['type']) => {
    const now = new Date().toISOString();
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          lastActivityAt: now,
          activities: [
            {
              id: Math.random().toString(36).substring(2, 9),
              text,
              timestamp: now,
              type
            },
            ...lead.activities
          ]
        };
      }
      return lead;
    });
    saveLeads(updated);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(leads, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm_leads_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (dataStr: string): boolean => {
    try {
      const parsed = JSON.parse(dataStr);
      if (Array.isArray(parsed)) {
        // Validate basic properties
        const isValid = parsed.every(item => 
          item.id && 
          typeof item.name === 'string' && 
          typeof item.company === 'string' &&
          typeof item.value === 'number' &&
          item.stage
        );
        if (isValid) {
          const saved = saveLeads(migrateLeadStages(parsed));
          return saved.success;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <CRMContext.Provider value={{
      leads,
      isHydrating,
      persistError,
      lastSavedAt,
      dashboardStats,
      dashboardFilter,
      setDashboardFilter,
      navigateWithDashboardFilter,
      leadModal,
      deleteModalLeadId,
      openAddLead,
      openEditLead,
      openViewLead,
      openDeleteLead,
      closeLeadModal,
      closeDeleteModal,
      activeView,
      setActiveView,
      selectedLeadId,
      setSelectedLeadId,
      findDuplicateByPhone,
      searchQuery,
      setSearchQuery,
      filterPriority,
      setFilterPriority,
      filterSource,
      setFilterSource,
      filterStage,
      setFilterStage,
      clearLeadFilters,
      addLead,
      updateLead,
      deleteLead,
      moveLeadStage,
      addTask,
      toggleTask,
      deleteTask,
      addActivity,
      exportData,
      importData,
      theme,
      toggleTheme,
      toasts,
      showToast,
      removeToast,
      undoLastAction,
      hasUndo
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
