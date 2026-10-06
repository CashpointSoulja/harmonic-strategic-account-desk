import type { Account, Campaign, DeskState, Evidence, Person, Route, Seller, Signal, Stakeholder } from './types';

/** The desk runs on a fixed date so scores, expiry and reminders are reproducible. */
export const DESK_TODAY = '2026-10-06';
export const ACCESSED = '2026-10-06';

export const SELLERS: Seller[] = [
  { id: 'sa', label: 'Seller A', territory: 'Financial services, East', capacity: 3 },
  { id: 'sb', label: 'Seller B', territory: 'Industrials and retail', capacity: 3 },
  { id: 'sc', label: 'Seller C', territory: 'Energy and life sciences', capacity: 3 },
];

export const PEOPLE: Person[] = [
  { id: 'sa', label: 'Seller A', role: 'seller' },
  { id: 'sb', label: 'Seller B', role: 'seller' },
  { id: 'sc', label: 'Seller C', role: 'seller' },
  { id: 'gtm', label: 'Strategic GTM Associate', role: 'associate' },
  { id: 'ev', label: 'Events lead', role: 'events' },
];

const JPMC_LETTER = 'https://www.jpmorganchase.com/ir/annual-report/2025/ar-ceo-letters';
const JPMC_TECH = 'https://www.jpmorganchase.com/about/technology';
const JPMC_LEADERSHIP = 'https://www.jpmorganchase.com/about/leadership';
const JPMC_SUPPLIER_LETTER = 'https://www.jpmorgan.com/technology/technology-blog/open-letter-to-our-suppliers';

export const ACCOUNTS: Account[] = [
  {
    id: 'jpmc',
    name: 'JPMorganChase',
    sector: 'Banking',
    synthetic: false,
    profile: 'Real company, public sources only. Prospect hypothesis: not a Harmonic customer or confirmed target.',
    situation:
      'JPMorganChase is a large, heavily regulated US bank whose 2025 shareholder letter commits to incorporating AI in everything it does.',
    fit: { regulated: true, publishedAiAdoption: true, enterpriseScale: true, sensitiveData: null },
    fitEvidence: { publishedAiAdoption: 'e-jpmc-1', enterpriseScale: 'e-jpmc-3', regulated: 'e-jpmc-2' },
  },
  syn('halv', 'Halvorsen Mutual', 'Insurance', 'Halvorsen Mutual is a synthetic mutual insurer piloting AI claims assistants across three regions.', { regulated: true, publishedAiAdoption: true, enterpriseScale: true, sensitiveData: true }),
  syn('corr', 'Corriveau Health', 'Health system', 'Corriveau Health is a synthetic hospital network that has opened clinician access to two AI note-taking tools.', { regulated: true, publishedAiAdoption: true, enterpriseScale: null, sensitiveData: true }),
  syn('bright', 'Brightwater Financial', 'Banking', 'Brightwater Financial is a synthetic regional bank group rolling out coding assistants to its engineering teams.', { regulated: true, publishedAiAdoption: true, enterpriseScale: true, sensitiveData: true }),
  syn('kest', 'Kestrel Aerospace', 'Aerospace', 'Kestrel Aerospace is a synthetic defence supplier with an export-controlled design estate and no public AI policy.', { regulated: true, publishedAiAdoption: null, enterpriseScale: true, sensitiveData: true }),
  syn('mer', 'Meridian Retail Holdings', 'Retail', 'Meridian Retail Holdings is a synthetic retail group whose merchandising teams use AI agents to draft supplier terms.', { regulated: false, publishedAiAdoption: true, enterpriseScale: true, sensitiveData: null }),
  syn('ostr', 'Ostrander Energy', 'Energy', 'Ostrander Energy is a synthetic utility operator modernising its grid analytics with AI copilots.', { regulated: true, publishedAiAdoption: true, enterpriseScale: true, sensitiveData: null }),
  syn('vant', 'Vantage Therapeutics', 'Pharma', 'Vantage Therapeutics is a synthetic drug developer using AI tools on trial protocol drafts.', { regulated: true, publishedAiAdoption: null, enterpriseScale: null, sensitiveData: true }),
  syn('larch', 'Larchmont Bancorp', 'Banking', 'Larchmont Bancorp is a synthetic bank holding company that announced an AI centre of excellence.', { regulated: true, publishedAiAdoption: true, enterpriseScale: true, sensitiveData: true }),
];

function syn(id: string, name: string, sector: string, situation: string, fit: Account['fit']): Account {
  return { id, name, sector, synthetic: true, profile: 'Synthetic fixture. Fictional company for demonstration.', situation, fit, fitEvidence: {} };
}

export const EVIDENCE: Evidence[] = [
  {
    id: 'e-jpmc-1', accountId: 'jpmc', kind: 'observed-fact', provenance: 'public-source', confidence: 'high',
    sentence: 'The CEO letter says success depends on moving quickly "including incorporating artificial intelligence (AI) in everything we do."',
    sourceTitle: 'Chairman and CEO Letter to Shareholders, Annual Report 2025', sourceUrl: JPMC_LETTER, eventDate: '2026-04-06', accessed: ACCESSED,
  },
  {
    id: 'e-jpmc-2', accountId: 'jpmc', kind: 'observed-fact', provenance: 'public-source', confidence: 'high',
    sentence: 'The same letter says "AI will also introduce serious new risks — from deepfakes and misinformation to cybersecurity vulnerabilities."',
    sourceTitle: 'Chairman and CEO Letter to Shareholders, Annual Report 2025', sourceUrl: JPMC_LETTER, eventDate: '2026-04-06', accessed: ACCESSED,
  },
  {
    id: 'e-jpmc-3', accountId: 'jpmc', kind: 'observed-fact', provenance: 'public-source', confidence: 'high',
    sentence: 'The technology page cites $19.8 billion in tech investment, marked as the 2026 total.',
    sourceTitle: 'JPMorganChase Technology page (undated; read on access date)', sourceUrl: JPMC_TECH, eventDate: ACCESSED, accessed: ACCESSED,
  },
  {
    id: 'e-jpmc-4', accountId: 'jpmc', kind: 'observed-fact', provenance: 'public-source', confidence: 'high',
    sentence: 'The CISO published an open letter warning that the SaaS delivery model is creating a substantial vulnerability in the software supply chain.',
    sourceTitle: 'An open letter to third-party suppliers, by Patrick Opet, Chief Information Security Officer', sourceUrl: JPMC_SUPPLIER_LETTER, eventDate: '2025-04-26', accessed: ACCESSED,
  },
  {
    id: 'e-jpmc-5', accountId: 'jpmc', kind: 'observed-fact', provenance: 'public-source', confidence: 'high',
    sentence: 'The leadership page lists a Global Chief Information Officer, a Chief Data & Analytics Officer and a General Counsel.',
    sourceTitle: 'JPMorganChase Leadership page', sourceUrl: JPMC_LEADERSHIP, eventDate: ACCESSED, accessed: ACCESSED,
  },
  {
    id: 'e-jpmc-6', accountId: 'jpmc', kind: 'hypothesis', provenance: 'analyst-hypothesis', confidence: 'low',
    sentence: 'Hypothesis: an "AI in everything" mandate plus a public CISO stance on third-party software risk makes governed employee and agent AI use a plausible security-leadership topic.',
    sourceTitle: 'Desk hypothesis drawn from e-jpmc-1 and e-jpmc-4', sourceUrl: null, eventDate: ACCESSED, accessed: ACCESSED,
    note: 'Not confirmed by anyone at JPMorganChase.',
  },
  ...['halv', 'corr', 'bright', 'kest', 'mer', 'ostr', 'vant', 'larch'].map<Evidence>((id) => ({
    id: `e-${id}-1`, accountId: id, kind: 'observed-fact', provenance: 'synthetic-fixture', confidence: 'medium',
    sentence: `Synthetic fixture: ${ACCOUNTS.find((a) => a.id === id)!.situation}`,
    sourceTitle: 'Synthetic fixture', sourceUrl: null, eventDate: '2026-09-15', accessed: ACCESSED,
  })),
];

export const SIGNALS: Signal[] = [
  {
    id: 'sg-jpmc-letter', accountId: 'jpmc', type: 'ai-initiative', provenance: 'public-source', relevance: 5, shelfLifeDays: 270,
    headline: 'CEO letter commits to incorporating AI in everything the firm does',
    sourceTitle: 'Annual Report 2025 CEO letter', sourceUrl: JPMC_LETTER, sourceDate: '2026-04-06',
    whyNow: 'A firm-wide AI mandate means employee and agent AI use is growing faster than policy can follow.',
    followOn: 'Map who owns AI usage policy under the CIO and Chief Data & Analytics Officer.',
  },
  {
    id: 'sg-jpmc-supplier', accountId: 'jpmc', type: 'leadership', provenance: 'public-source', relevance: 4, shelfLifeDays: 180,
    headline: 'CISO open letter to third-party suppliers on SaaS supply-chain risk',
    sourceTitle: 'JPMorganChase tech blog', sourceUrl: JPMC_SUPPLIER_LETTER, sourceDate: '2025-04-26',
    whyNow: 'Shows how the security office thinks about third-party software, but it is too old to be the reason to reach out now.',
    followOn: 'Keep as background context only.',
  },
  {
    id: 'sg-jpmc-cybermonth', accountId: 'jpmc', type: 'event', provenance: 'public-source', relevance: 3, shelfLifeDays: 30,
    headline: 'Cybersecurity Month content framed "for the age of AI" on the technology page',
    sourceTitle: 'the undated JPMorganChase Technology page, read', sourceUrl: JPMC_TECH, sourceDate: ACCESSED,
    whyNow: 'October content shows AI-era security is on the public agenda this month.',
    followOn: 'Propose an AI-governance seat at a peer CISO roundtable, not a cold note.',
  },
  synSig('sg-halv', 'halv', 'ai-initiative', 'Claims AI pilot expands to a third region', '2026-09-28', 4, 90),
  synSig('sg-corr', 'corr', 'regulatory', 'State health regulator issues guidance on clinical AI notes', '2026-09-10', 5, 120),
  synSig('sg-bright', 'bright', 'leadership', 'New CISO appointed from a large card issuer', '2026-09-22', 4, 120),
  synSig('sg-kest-old', 'kest', 'news', 'Supplier portal breach disclosed', '2026-02-14', 3, 60),
  synSig('sg-mer', 'mer', 'event', 'Retail CISO dinner confirmed for October 22', '2026-09-30', 3, 30),
  synSig('sg-ostr', 'ostr', 'ai-initiative', 'Grid analytics copilot moves to production', '2026-09-18', 4, 90),
  synSig('sg-vant', 'vant', 'regulatory', 'Trial sponsor asks for AI-use disclosures in protocols', '2026-08-30', 4, 90),
  {
    id: 'sg-vant-rumour', accountId: 'vant', type: 'news', provenance: 'analyst-hypothesis', relevance: 2, shelfLifeDays: 30,
    headline: 'Heard the CIO might be leaving', sourceTitle: 'Unsourced seller note', sourceUrl: null, sourceDate: '2026-10-02',
    whyNow: 'Unsourced.', followOn: 'Find a source or discard.',
  },
];

function synSig(id: string, accountId: string, type: Signal['type'], headline: string, sourceDate: string, relevance: Signal['relevance'], shelfLifeDays: number): Signal {
  return {
    id, accountId, type, headline: `${headline} (synthetic)`, sourceTitle: 'Synthetic fixture', sourceUrl: null, sourceDate, relevance, shelfLifeDays,
    provenance: 'synthetic-fixture',
    whyNow: 'Synthetic fixture: shows how a fresh trigger changes priority.',
    followOn: 'Draft the five-sentence brief and pick the route.',
  };
}

function seat(accountId: string, role: Stakeholder['role'], title: string, authority: Stakeholder['authority'], coverage: Stakeholder['coverage'], hypothesis: string): Stakeholder {
  return { id: `${accountId}-${role}`, accountId, role, title, publicName: null, nameEvidenceId: null, uncertain: false, authority, coverage, hypothesis };
}

export const STAKEHOLDERS: Stakeholder[] = [
  {
    ...seat('jpmc', 'ciso', 'Chief Information Security Officer', 'decides', 'mapped', 'the security office has spoken publicly about third-party software risk'),
    publicName: 'Patrick Opet', nameEvidenceId: 'e-jpmc-4', uncertain: true,
  },
  {
    ...seat('jpmc', 'ai-platform', 'Chief Data & Analytics Officer', 'influences', 'mapped', 'the data and analytics office is likely to shape how AI tools are adopted'),
    publicName: 'Teresa Heitsenrether', nameEvidenceId: 'e-jpmc-5',
  },
  {
    ...seat('jpmc', 'exec-sponsor', 'Global Chief Information Officer', 'influences', 'mapped', 'the CIO organisation runs the technology estate the AI mandate lands on'),
    publicName: 'Lori Beer', nameEvidenceId: 'e-jpmc-5',
  },
  seat('jpmc', 'data-governance', 'Data governance owner (not found in public sources)', 'unknown', 'unknown', 'no public owner of AI data governance was found'),
  {
    ...seat('jpmc', 'procurement-legal', 'General Counsel (procurement lead not public)', 'influences', 'mapped', 'legal review will apply to any vendor touching employee prompts'),
    publicName: 'Stacey Friedman', nameEvidenceId: 'e-jpmc-5',
  },
  ...(['halv', 'corr', 'bright', 'kest', 'mer', 'ostr', 'vant', 'larch'] as const).flatMap((id, i) => [
    seat(id, 'ciso', 'CISO (synthetic seat)', 'decides', i % 3 === 2 ? 'mapped' : 'engaged', 'the CISO owns AI acceptable-use enforcement'),
    seat(id, 'ai-platform', 'Head of AI platform (synthetic seat)', i % 2 ? 'influences' : 'decides', i === 4 ? 'unknown' : 'mapped', 'the AI platform lead decides which tools reach employees'),
    seat(id, 'data-governance', 'Chief Data Officer (synthetic seat)', 'influences', i % 2 ? 'unknown' : 'mapped', 'data governance sets classification rules'),
    seat(id, 'procurement-legal', 'Procurement and legal (synthetic seat)', 'influences', i < 3 ? 'mapped' : 'unknown', 'procurement gates any new security vendor'),
    seat(id, 'exec-sponsor', 'Executive sponsor (synthetic seat)', 'unknown', 'unknown', 'no sponsor has been identified'),
  ]),
];

function route(r: Partial<Route> & Pick<Route, 'id' | 'accountId' | 'introducer' | 'introducerKind' | 'targetStakeholderId' | 'basis'>): Route {
  return { synthetic: true, relationshipVerified: false, introducerPermission: false, recipientConfirmed: false, internalNote: '', lastAskedOn: null, ...r };
}

export const ROUTES: Route[] = [
  route({
    id: 'r-jpmc-board', accountId: 'jpmc', introducer: 'Harmonic board and investor network (listed on the About page)', introducerKind: 'investor',
    targetStakeholderId: 'jpmc-ciso', basis: 'public-affiliation', synthetic: false,
    internalNote: 'Public affiliation only. No evidence anyone on the About page knows JPMorganChase security leadership. Ask Harmonic leadership before ranking higher.',
  }),
  route({
    id: 'r-jpmc-peer', accountId: 'jpmc', introducer: 'Peer financial-services CISO roundtable (hypothesis)', introducerKind: 'partner',
    targetStakeholderId: 'jpmc-ai-platform', basis: 'hypothesis', synthetic: false,
    internalNote: 'Hypothesis only. No roundtable, host or attendee has been confirmed.',
  }),
  route({
    id: 'r-bright', accountId: 'bright', introducer: 'Advisor S-02, former deputy CISO at Brightwater (synthetic)', introducerKind: 'advisor',
    targetStakeholderId: 'bright-ciso', basis: 'verified-relationship', relationshipVerified: true, introducerPermission: true, recipientConfirmed: true,
    internalNote: 'Synthetic: advisor confirmed on a call that they worked with the new CISO and are happy to introduce.',
  }),
  route({
    id: 'r-halv', accountId: 'halv', introducer: 'Channel partner P-07, incumbent SOC provider (synthetic)', introducerKind: 'partner',
    targetStakeholderId: 'halv-ciso', basis: 'verified-relationship', relationshipVerified: true,
    internalNote: 'Synthetic: relationship confirmed, but the partner has not agreed to introduce yet.',
  }),
  route({
    id: 'r-corr', accountId: 'corr', introducer: 'Team network: solutions engineer T-03 (synthetic)', introducerKind: 'team',
    targetStakeholderId: 'corr-ai-platform', basis: 'verified-relationship', relationshipVerified: true, introducerPermission: true, recipientConfirmed: true,
    lastAskedOn: '2026-09-29', internalNote: 'Synthetic: intro made on Sep 29; meeting prep under way.',
  }),
  route({
    id: 'r-mer', accountId: 'mer', introducer: 'Investor portfolio CISO dinner host (synthetic)', introducerKind: 'investor',
    targetStakeholderId: 'mer-ciso', basis: 'public-affiliation',
    internalNote: 'Synthetic: shared investor only. Host has not been asked.',
  }),
  route({
    id: 'r-ostr', accountId: 'ostr', introducer: 'Advisor S-09, utilities security council chair (synthetic)', introducerKind: 'advisor',
    targetStakeholderId: 'ostr-ciso', basis: 'verified-relationship', relationshipVerified: true, introducerPermission: true, recipientConfirmed: true,
    lastAskedOn: '2026-09-20', internalNote: 'Synthetic: advisor was asked for a different account on Sep 20.',
  }),
  route({
    id: 'r-vant', accountId: 'vant', introducer: 'Customer reference C-12, life-sciences CISO (synthetic)', introducerKind: 'customer',
    targetStakeholderId: 'vant-ciso', basis: 'hypothesis',
    internalNote: 'Synthetic: we think the reference knows the Vantage CISO from a past role. Unconfirmed.',
  }),
];

export const CAMPAIGNS: Campaign[] = [
  camp('c-jpmc', 'jpmc', 'sa', 'route', 'gtm', 'Ask Harmonic leadership whether anyone has a verified JPMorganChase security relationship', '2026-10-09', 7, '2026-10-02', 'Seat at a peer FS CISO roundtable (not yet scheduled)', 'r-jpmc-board'),
  camp('c-halv', 'halv', 'sa', 'brief', 'sa', 'Ask partner P-07 for permission to introduce', '2026-10-08', 5, '2026-10-01', null, 'r-halv'),
  camp('c-corr', 'corr', 'sa', 'meeting-prep', 'sa', 'Prepare the AI-notes risk walkthrough for the platform lead', '2026-10-12', 7, '2026-10-03', 'Clinical AI governance breakfast, Nov 4 (synthetic)', 'r-corr'),
  camp('c-bright', 'bright', 'sb', 'intro-prep', 'gtm', 'Prepare the introducer brief for advisor S-02', '2026-10-07', 5, '2026-10-05', null, 'r-bright'),
  camp('c-kest', 'kest', 'sb', 'map', 'sb', null, null, 10, '2026-09-24', null, null),
  {
    ...camp('c-mer', 'mer', 'sb', 'stalled', null, null, null, 7, '2026-09-17', 'Retail CISO dinner, Oct 22 (synthetic)', 'r-mer'),
    resumeStage: 'route', failureReason: 'Event follow-up had no owner and no dated next step after Sep 17.',
  },
  camp('c-ostr', 'ostr', 'sc', 'route', 'sc', 'Pick a second introducer while S-09 is in cooldown', '2026-10-01', 7, '2026-09-22', null, 'r-ostr'),
  camp('c-vant', 'vant', 'sc', 'brief', 'gtm', 'Verify whether reference C-12 actually knows the CISO', '2026-10-10', 7, '2026-09-30', null, 'r-vant'),
  {
    ...camp('c-larch', 'larch', 'sa', 'parked', 'sa', null, null, 7, '2026-09-30', null, null),
    failureReason: 'Parked: Seller A is at capacity (3 of 3 active).',
  },
];

function camp(id: string, accountId: string, sellerId: string, stage: Campaign['stage'], ownerId: string | null, nextAction: string | null, nextActionDate: string | null, slaDays: number, lastTouch: string, eventPlan: string | null, introducerBriefRouteId: string | null): Campaign {
  return { id, accountId, sellerId, stage, resumeStage: null, ownerId, nextAction, nextActionDate, slaDays, lastTouch, eventPlan, introducerBriefRouteId, failureReason: null };
}

export function initialState(): DeskState {
  return structuredClone({
    version: 1 as const,
    today: DESK_TODAY,
    campaigns: CAMPAIGNS,
    routes: ROUTES,
    signals: SIGNALS,
    evidence: EVIDENCE,
    stakeholders: STAKEHOLDERS,
    briefs: {},
    tickets: [],
    log: [],
  });
}
