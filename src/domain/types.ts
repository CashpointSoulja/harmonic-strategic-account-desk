export type Provenance = 'public-source' | 'synthetic-fixture' | 'analyst-hypothesis';
export type Confidence = 'high' | 'medium' | 'low';
export type ClaimKind = 'observed-fact' | 'hypothesis';

export interface Evidence {
  id: string;
  accountId: string;
  sentence: string;
  sourceTitle: string;
  sourceUrl: string | null;
  /** Publication or event date, ISO yyyy-mm-dd. */
  eventDate: string;
  /** Date the source was read. */
  accessed: string;
  confidence: Confidence;
  provenance: Provenance;
  kind: ClaimKind;
  note?: string;
}

export type SignalType = 'leadership' | 'ai-initiative' | 'regulatory' | 'event' | 'news';

export interface Signal {
  id: string;
  accountId: string;
  type: SignalType;
  headline: string;
  sourceTitle: string;
  sourceUrl: string | null;
  sourceDate: string;
  /** 1 (weak) to 5 (strong) relevance to AI governance. */
  relevance: 1 | 2 | 3 | 4 | 5;
  shelfLifeDays: number;
  provenance: Provenance;
  whyNow: string;
  followOn: string;
}

export type RouteBasis = 'verified-relationship' | 'public-affiliation' | 'hypothesis';
export type IntroducerKind = 'investor' | 'advisor' | 'partner' | 'customer' | 'team';

export interface Route {
  id: string;
  accountId: string;
  introducer: string;
  introducerKind: IntroducerKind;
  targetStakeholderId: string;
  basis: RouteBasis;
  synthetic: boolean;
  relationshipVerified: boolean;
  introducerPermission: boolean;
  recipientConfirmed: boolean;
  /** Internal note. Never leaves the desk in share mode. */
  internalNote: string;
  lastAskedOn: string | null;
}

export type CommitteeRole = 'ciso' | 'ai-platform' | 'data-governance' | 'procurement-legal' | 'exec-sponsor';
export type Authority = 'decides' | 'influences' | 'unknown';
export type Coverage = 'engaged' | 'mapped' | 'unknown';

export interface Stakeholder {
  id: string;
  accountId: string;
  role: CommitteeRole;
  title: string;
  /** Only a name published by the account itself. Null for synthetic accounts and unknown seats. */
  publicName: string | null;
  nameEvidenceId: string | null;
  /** True when the name or title may be out of date. Stripped from share exports. */
  uncertain: boolean;
  authority: Authority;
  coverage: Coverage;
  hypothesis: string;
}

export interface FitFactors {
  regulated: boolean | null;
  publishedAiAdoption: boolean | null;
  enterpriseScale: boolean | null;
  sensitiveData: boolean | null;
}

export interface Account {
  id: string;
  name: string;
  sector: string;
  synthetic: boolean;
  profile: string;
  situation: string;
  fit: FitFactors;
  fitEvidence: Partial<Record<keyof FitFactors, string>>;
}

export type Stage = 'map' | 'route' | 'brief' | 'intro-prep' | 'meeting-prep' | 'engaged' | 'stalled' | 'parked';

export interface Campaign {
  id: string;
  accountId: string;
  sellerId: string;
  stage: Stage;
  /** Stage to return to when a stall is fixed. */
  resumeStage: Stage | null;
  ownerId: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  slaDays: number;
  lastTouch: string;
  eventPlan: string | null;
  introducerBriefRouteId: string | null;
  failureReason: string | null;
}

export interface Person {
  id: string;
  label: string;
  role: 'seller' | 'associate' | 'events';
}

export interface Seller {
  id: string;
  label: string;
  territory: string;
  capacity: number;
}

export interface PrepTicket {
  id: string;
  campaignId: string;
  kind: 'intro-request' | 'event-invite' | 'brief' | 'reminder';
  createdOn: string;
  body: string;
}

export interface BriefDraft {
  campaignId: string;
  sentences: [string, string, string, string, string];
  edited: boolean;
}

export interface DeskState {
  version: 1;
  today: string;
  campaigns: Campaign[];
  routes: Route[];
  signals: Signal[];
  evidence: Evidence[];
  stakeholders: Stakeholder[];
  briefs: Record<string, BriefDraft>;
  tickets: PrepTicket[];
  log: { at: string; text: string }[];
}
