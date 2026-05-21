import type { Lead } from '../types/crm';
import { SEED_LEADS } from '../utils/seedData';
import { migrateLeadStages } from '../utils/migrateStages';

export const STORAGE_KEYS = {
  leads: 'iqraa_crm_leads',
  meta: 'iqraa_crm_meta',
  legacy: 'crm_leads_data',
} as const;

export type StorageResult = { success: true } | { success: false; error: string };

export interface StorageMeta {
  updatedAt: string;
  source: 'localStorage';
}

function isValidLeadArray(data: unknown): data is Lead[] {
  return (
    Array.isArray(data) &&
    data.every(
      item =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.phone === 'string' &&
        item.stage
    )
  );
}

function readRaw(): Lead[] | null {
  for (const key of [STORAGE_KEYS.leads, STORAGE_KEYS.legacy]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (isValidLeadArray(parsed)) {
        if (key === STORAGE_KEYS.legacy) {
          const migrated = migrateLeadStages(parsed);
          writeLeads(migrated);
          localStorage.removeItem(STORAGE_KEYS.legacy);
          return migrated;
        }
        return migrateLeadStages(parsed);
      }
    } catch {
      /* try next key */
    }
  }
  return null;
}

export function initializeLeads(): Lead[] {
  const seeded = migrateLeadStages(SEED_LEADS);
  writeLeads(seeded);
  return seeded;
}

export function readLeads(): Lead[] {
  return readRaw() ?? initializeLeads();
}

export function writeLeads(leads: Lead[]): StorageResult {
  try {
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
    const meta: StorageMeta = {
      updatedAt: new Date().toISOString(),
      source: 'localStorage',
    };
    localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta));
    return { success: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'Browser storage is full. Export your data and remove some leads.',
      };
    }
    return { success: false, error: 'Could not save leads. Check browser storage permissions.' };
  }
}

export function readMeta(): StorageMeta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.meta);
    if (!raw) return null;
    return JSON.parse(raw) as StorageMeta;
  } catch {
    return null;
  }
}
