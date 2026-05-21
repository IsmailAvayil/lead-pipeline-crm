import type { LeadPriority, LeadSource, LeadStage } from '../types/crm';

export interface LeadFormValues {
  name: string;
  company: string;
  phone: string;
  email: string;
  source: LeadSource | '';
  assignedTo: string;
  priority: LeadPriority;
  stage: LeadStage;
  value: number;
  confidence: number;
  notes: string;
}

export type LeadFieldErrors = Partial<Record<keyof LeadFormValues | 'form', string>>;

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function validateLeadForm(values: LeadFormValues): { valid: boolean; errors: LeadFieldErrors } {
  const errors: LeadFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Customer name is required.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Customer name must be at least 2 characters.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhone(values.phone)) {
    errors.phone = 'Enter a valid phone number (7–15 digits).';
  }

  if (!values.source) {
    errors.source = 'Lead source is required.';
  }

  if (!values.assignedTo.trim()) {
    errors.assignedTo = 'Assigned staff is required.';
  }

  if (!values.priority) {
    errors.priority = 'Priority is required.';
  }

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.value < 0) {
    errors.value = 'Deal value cannot be negative.';
  }

  if (values.confidence < 0 || values.confidence > 100) {
    errors.confidence = 'Confidence must be between 0 and 100.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= 7 && digits.length <= 15;
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return na.length > 0 && na === nb;
}
