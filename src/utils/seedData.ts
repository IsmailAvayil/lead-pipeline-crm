import type { Lead } from '../types/crm';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Connor',
    company: 'Vercel Inc.',
    email: 'sarah.connor@vercel.com',
    phone: '+1 (555) 019-2834',
    value: 45000,
    stage: 'New Lead',
    priority: 'High',
    confidence: 30,
    source: 'Website',
    notes: 'Interested in enterprise hosting and advanced caching edge middleware configuration for their core platform.',
    tasks: [
      { id: generateId(), title: 'Prepare custom enterprise hosting deck', completed: false },
      { id: generateId(), title: 'Introductory discovery call', completed: true },
    ],
    activities: [
      { id: generateId(), text: 'Discovery call completed. Key pain points identified.', timestamp: '2026-05-20T10:00:00Z', type: 'success' },
      { id: generateId(), text: 'Lead created from website contact form.', timestamp: '2026-05-19T08:14:00Z', type: 'info' }
    ],
    createdAt: '2026-05-19T08:14:00Z',
    lastActivityAt: '2026-05-20T10:00:00Z',
    assignedTo: 'Alex Mercer'
  },
  {
    id: 'lead-2',
    name: 'Elon Vance',
    company: 'Supabase Ltd.',
    email: 'e.vance@supabase.io',
    phone: '+1 (555) 014-9821',
    value: 65000,
    stage: 'Contracted',
    priority: 'High',
    confidence: 45,
    source: 'LinkedIn',
    notes: 'Reached out regarding multi-region backup syncing options and dedicated database instances for custom database scale.',
    tasks: [
      { id: generateId(), title: 'Follow up on technical architecture email', completed: false },
      { id: generateId(), title: 'Review multi-region compliance guidelines', completed: true }
    ],
    activities: [
      { id: generateId(), text: 'Sent email reply detailing custom dedicated instances.', timestamp: '2026-05-21T09:30:00Z', type: 'info' },
      { id: generateId(), text: 'Inbound message from LinkedIn profile.', timestamp: '2026-05-18T14:22:00Z', type: 'info' }
    ],
    createdAt: '2026-05-18T14:22:00Z',
    lastActivityAt: '2026-05-21T09:30:00Z',
    assignedTo: 'Sarah Jenkins'
  },
  {
    id: 'lead-3',
    name: 'Marcus Aurelius',
    company: 'Linear App',
    email: 'm.aurelius@linear.app',
    phone: '+1 (555) 012-3456',
    value: 85000,
    stage: 'Contracted',
    priority: 'Medium',
    confidence: 60,
    source: 'Referral',
    notes: 'Referred by Vercel CEO. Linear is looking to scale their CRM integrations and requires enterprise SLAs.',
    tasks: [
      { id: generateId(), title: 'Schedule demonstration with product engineering', completed: false },
      { id: generateId(), title: 'Draft preliminary custom SLA document', completed: false },
      { id: generateId(), title: 'Qualifying questionnaire submitted', completed: true }
    ],
    activities: [
      { id: generateId(), text: 'Lead qualified by sales engineering team.', timestamp: '2026-05-20T16:45:00Z', type: 'success' },
      { id: generateId(), text: 'Completed qualification call with CTO.', timestamp: '2026-05-20T14:00:00Z', type: 'info' },
      { id: generateId(), text: 'Created referral ticket in workspace.', timestamp: '2026-05-15T11:00:00Z', type: 'info' }
    ],
    createdAt: '2026-05-15T11:00:00Z',
    lastActivityAt: '2026-05-20T16:45:00Z',
    assignedTo: 'Alex Mercer'
  },
  {
    id: 'lead-4',
    name: 'Helena Troy',
    company: 'Stripe Payments',
    email: 'htroy@stripe.com',
    phone: '+1 (555) 987-6543',
    value: 120000,
    stage: 'Follow Up',
    priority: 'High',
    confidence: 70,
    source: 'Website',
    notes: 'Custom dashboard development proposal submitted. Looking for specialized security audit certifications.',
    tasks: [
      { id: generateId(), title: 'Send SOC2 Type II compliance reports', completed: true },
      { id: generateId(), title: 'Revise proposal pricing structure', completed: false },
      { id: generateId(), title: 'Review feedback on pricing options', completed: false }
    ],
    activities: [
      { id: generateId(), text: 'Proposal PDF uploaded and sent to decision makers.', timestamp: '2026-05-19T10:15:00Z', type: 'task' },
      { id: generateId(), text: 'SOC2 Type II documentation dispatched.', timestamp: '2026-05-18T16:00:00Z', type: 'success' },
      { id: generateId(), text: 'Proposal review call completed.', timestamp: '2026-05-17T13:00:00Z', type: 'info' }
    ],
    createdAt: '2026-05-10T09:00:00Z',
    lastActivityAt: '2026-05-19T10:15:00Z',
    assignedTo: 'Marcus Vance'
  },
  {
    id: 'lead-5',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@waynecorp.com',
    phone: '+1 (555) 743-9812',
    value: 350000,
    stage: 'Follow Up',
    priority: 'High',
    confidence: 85,
    source: 'Partner',
    notes: 'Large-scale hardware and defense tracking system integration. Contract negotiations ongoing with legal teams.',
    tasks: [
      { id: generateId(), title: 'Legal review of Master Services Agreement (MSA)', completed: false },
      { id: generateId(), title: 'Set up final board presentation', completed: false },
      { id: generateId(), title: 'Align custom support tier pricing', completed: true }
    ],
    activities: [
      { id: generateId(), text: 'Drafted and sent final MSA to Wayne Legal Dept.', timestamp: '2026-05-20T17:30:00Z', type: 'warning' },
      { id: generateId(), text: 'Completed support tier alignment meeting.', timestamp: '2026-05-19T11:00:00Z', type: 'success' },
      { id: generateId(), text: 'Demo of core security protocol complete.', timestamp: '2026-05-14T10:30:00Z', type: 'info' }
    ],
    createdAt: '2026-05-01T08:00:00Z',
    lastActivityAt: '2026-05-20T17:30:00Z',
    assignedTo: 'Marcus Vance'
  },
  {
    id: 'lead-6',
    name: 'Ada Lovelace',
    company: 'Retool Inc.',
    email: 'ada@retool.com',
    phone: '+1 (555) 438-1298',
    value: 58000,
    stage: 'Converted',
    priority: 'Medium',
    confidence: 100,
    source: 'Website',
    notes: 'Retool team has signed the deal for advanced integration modules! Onboarding scheduled for next week.',
    tasks: [
      { id: generateId(), title: 'Schedule kickoff and onboarding session', completed: true },
      { id: generateId(), title: 'Provision enterprise API keys', completed: true },
      { id: generateId(), title: 'Invoice dispatched and paid', completed: true }
    ],
    activities: [
      { id: generateId(), text: 'Deal won! Paid invoice received successfully.', timestamp: '2026-05-18T15:20:00Z', type: 'success' },
      { id: generateId(), text: 'Enterprise API environment configured.', timestamp: '2026-05-18T10:00:00Z', type: 'info' },
      { id: generateId(), text: 'Signed contract uploaded to file system.', timestamp: '2026-05-17T16:30:00Z', type: 'success' }
    ],
    createdAt: '2026-05-05T09:30:00Z',
    lastActivityAt: '2026-05-18T15:20:00Z',
    assignedTo: 'Sarah Jenkins'
  },
  {
    id: 'lead-7',
    name: 'Linus Torvalds',
    company: 'Linux Foundation',
    email: 'torvalds@linux.org',
    phone: '+1 (555) 839-0192',
    value: 28000,
    stage: 'Follow Up',
    priority: 'Low',
    confidence: 0,
    source: 'Cold Outreach',
    notes: 'Decided to build an in-house open-source version instead of using proprietary SaaS. Good contact for future feedback.',
    tasks: [
      { id: generateId(), title: 'Send exit feedback questionnaire', completed: true }
    ],
    activities: [
      { id: generateId(), text: 'Deal marked as lost: in-house solution selected.', timestamp: '2026-05-12T14:00:00Z', type: 'error' },
      { id: generateId(), text: 'Exit feedback received. Praised UI but prefers self-hosting.', timestamp: '2026-05-13T09:00:00Z', type: 'info' }
    ],
    createdAt: '2026-04-20T10:00:00Z',
    lastActivityAt: '2026-05-13T09:00:00Z',
    assignedTo: 'Sarah Jenkins'
  },
  {
    id: 'lead-8',
    name: 'Grace Hopper',
    company: 'Airbnb',
    email: 'grace.hopper@airbnb.com',
    phone: '+1 (555) 723-0199',
    value: 75000,
    stage: 'Follow Up',
    priority: 'Medium',
    confidence: 65,
    source: 'Referral',
    notes: 'Looking for a dedicated pipeline monitoring dashboard. Security, reliability, and fast response times are critical.',
    tasks: [
      { id: generateId(), title: 'Submit customized visual mockups', completed: false },
      { id: generateId(), title: 'Deliver official technical proposal document', completed: true }
    ],
    activities: [
      { id: generateId(), text: 'Technical proposal document dispatched.', timestamp: '2026-05-19T14:30:00Z', type: 'success' },
      { id: generateId(), text: 'Mockup review conference completed.', timestamp: '2026-05-16T11:00:00Z', type: 'info' }
    ],
    createdAt: '2026-05-08T10:00:00Z',
    lastActivityAt: '2026-05-19T14:30:00Z',
    assignedTo: 'Sarah Jenkins'
  },
  {
    id: 'lead-9',
    name: 'Alan Turing',
    company: 'Bletchley Park',
    email: 'alan@bletchley.co.uk',
    phone: '+44 7911 123456',
    value: 95000,
    stage: 'Follow Up',
    priority: 'High',
    confidence: 80,
    source: 'LinkedIn',
    notes: 'Negotiating specialized decryption analytics suite modules. Requires secure offline-capable components.',
    tasks: [
      { id: generateId(), title: 'Discuss custom offline-first encryption capabilities', completed: true },
      { id: generateId(), title: 'Review localized regulatory approvals', completed: false }
    ],
    activities: [
      { id: generateId(), text: 'Met offline-first spec requirements checklist.', timestamp: '2026-05-20T16:00:00Z', type: 'success' },
      { id: generateId(), text: 'Sent updated pricing with compliance premiums.', timestamp: '2026-05-18T12:00:00Z', type: 'info' }
    ],
    createdAt: '2026-05-06T09:00:00Z',
    lastActivityAt: '2026-05-20T16:00:00Z',
    assignedTo: 'Alex Mercer'
  },
  {
    id: 'lead-10',
    name: 'Sherlock Holmes',
    company: 'Consulting Detective',
    email: 'sherlock@221b.co.uk',
    phone: '+44 20 7946 0958',
    value: 30000,
    stage: 'New Lead',
    priority: 'Low',
    confidence: 15,
    source: 'Website',
    notes: 'Interested in analytics data-mining options. Seems highly interested in pattern recognition algorithms.',
    tasks: [
      { id: generateId(), title: 'Reach out to introduce core matching algorithm', completed: false }
    ],
    activities: [
      { id: generateId(), text: 'Lead generated via main landing page query.', timestamp: '2026-05-21T07:15:00Z', type: 'info' }
    ],
    createdAt: '2026-05-21T07:15:00Z',
    lastActivityAt: '2026-05-21T07:15:00Z',
    assignedTo: 'Marcus Vance'
  }
];
