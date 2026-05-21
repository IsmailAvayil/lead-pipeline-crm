import type { Lead } from '../types/crm';
import {
  readLeads,
  writeLeads,
  readMeta,
  initializeLeads,
  type StorageResult,
  type StorageMeta,
} from '../services/leadStorage';

/** Simulated network delay for mock API (ms) */
const MOCK_LATENCY_MS = 80;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API — persists all lead data in the browser via localStorage.
 * Swap this module for real HTTP calls when a backend is available.
 */
export const leadsApi = {
  async getAll(): Promise<Lead[]> {
    await delay(MOCK_LATENCY_MS);
    return readLeads();
  },

  async saveAll(leads: Lead[]): Promise<StorageResult> {
    await delay(MOCK_LATENCY_MS);
    return writeLeads(leads);
  },

  async resetToSeed(): Promise<Lead[]> {
    await delay(MOCK_LATENCY_MS);
    return initializeLeads();
  },

  getMeta(): StorageMeta | null {
    return readMeta();
  },

  /** Synchronous read for instant hydration on page load */
  hydrate(): Lead[] {
    return readLeads();
  },

  persist(leads: Lead[]): StorageResult {
    return writeLeads(leads);
  },
};
