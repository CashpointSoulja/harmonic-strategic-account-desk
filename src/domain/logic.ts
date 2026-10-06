import { ACCOUNTS, PEOPLE, SELLERS } from './fixtures';
import type { Account, BriefDraft, Campaign, DeskState, Evidence, Route, Signal, Stage, Stakeholder } from './types';

const DAY = 86_400_000;
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
export const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
export const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const accountById = (id: string): Account => {
  const a = ACCOUNTS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown account ${id}`);
  return a;
};
export const personLabel = (id: string | null) => (id ? PEOPLE.find((p) => p.id === id)?.label ?? id : null);

/* ---------- Signals ---------- */

export type SignalVerdict = { status: 'usable' | 'stale' | 'unsupported' | 'future'; reason: string; ageDays: number; freshness: number };

export function judgeSignal(s: Signal, today: string): SignalVerdict {
  const ageDays = daysBetween(s.sourceDate, today);
  if (ageDays < 0) return { status: 'future', reason: 'Source date is after the desk date.', ageDays, freshness: 0 };
  if (s.provenance === 'analyst-hypothesis') return { status: 'unsupported', reason: 'No source. A hunch cannot be a trigger.', ageDays, freshness: 0 };
  if (s.provenance === 'public-source' && !s.sourceUrl) return { status: 'unsupported', reason: 'Public claim without a source URL.', ageDays, freshness: 0 };
  if (ageDays > s.shelfLifeDays) return { status: 'stale', reason: `Expired ${ageDays - s.shelfLifeDays} days ago (shelf life ${s.shelfLifeDays} days).`, ageDays, freshness: 0 };
  return { status: 'usable', reason: `Expires ${fmtDate(addDays(s.sourceDate, s.shelfLifeDays))}.`, ageDays, freshness: 1 - ageDays / s.shelfLifeDays };
}

const norm = (t: string) => t.toLowerCase().replace(/\(synthetic\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export const signalKey = (s: Signal) => (s.sourceUrl ? `${s.accountId}|${s.sourceUrl}|${norm(s.headline)}` : `${s.accountId}|${norm(s.headline)}`);

export function dedupeSignals(list: Signal[]): { kept: Signal[]; dropped: Signal[] } {
  const seen = new Set<string>();
  const kept: Signal[] = [];
  const dropped: Signal[] = [];
  for (const s of list) {
    const k = signalKey(s);
    if (seen.has(k) || kept.some((x) => x.id === s.id)) dropped.push(s);
    else { seen.add(k); kept.push(s); }
  }
  return { kept, dropped };
}

export function dedupeEvidence(list: Evidence[]): { kept: Evidence[]; dropped: Evidence[] } {
  const seen = new Set<string>();
  const kept: Evidence[] = [];
  const dropped: Evidence[] = [];
  for (const e of list) {
    const k = `${e.accountId}|${e.sourceUrl ?? 'none'}|${norm(e.sentence)}`;
    if (seen.has(k)) dropped.push(e);
    else { seen.add(k); kept.push(e); }
  }
  return { kept, dropped };
}

export function bestSignal(state: DeskState, accountId: string): Signal | null {
  const usable = state.signals
    .filter((s) => s.accountId === accountId)
    .map((s) => ({ s, v: judgeSignal(s, state.today) }))
    .filter((x) => x.v.status === 'usable')
    .sort((a, b) => b.s.relevance * b.v.freshness - a.s.relevance * a.v.freshness);
  return usable[0]?.s ?? null;
}

/* ---------- Routes ---------- */

export const INTRO_COOLDOWN_DAYS = 30;
export type RouteGate = { ready: boolean; blockers: string[] };

export function routeGate(r: Route, today: string): RouteGate {
  const blockers: string[] = [];
  if (r.basis !== 'verified-relationship') blockers.push(r.basis === 'public-affiliation' ? 'Public affiliation only: a shared investor, board or event is not a relationship.' : 'Hypothesis only: nobody has confirmed this relationship.');
  if (!r.relationshipVerified) blockers.push('Relationship not verified with the introducer.');
  if (!r.introducerPermission) blockers.push('Introducer has not given permission.');
  if (!r.recipientConfirmed) blockers.push('Recipient identity and current role not confirmed.');
  if (r.lastAskedOn && daysBetween(r.lastAskedOn, today) < INTRO_COOLDOWN_DAYS)
    blockers.push(`Introducer was asked ${daysBetween(r.lastAskedOn, today)} days ago; wait ${INTRO_COOLDOWN_DAYS} days between asks.`);
  return { ready: blockers.length === 0, blockers };
}

export const basisLabel: Record<Route['basis'], string> = {
  'verified-relationship': 'Verified relationship',
  'public-affiliation': 'Public affiliation only',
  hypothesis: 'Hypothesis',
};

export function routeScore(r: Route, today: string): number {
  let s = r.basis === 'verified-relationship' ? 40 : r.basis === 'public-affiliation' ? 15 : 5;
  if (r.relationshipVerified) s += 20;
  if (r.introducerPermission) s += 20;
  if (r.recipientConfirmed) s += 20;
  if (r.lastAskedOn && daysBetween(r.lastAskedOn, today) < INTRO_COOLDOWN_DAYS) s -= 30;
  return Math.max(0, Math.min(100, s));
}

export function bestRoute(state: DeskState, accountId: string): Route | null {
  return state.routes.filter((r) => r.accountId === accountId).sort((a, b) => routeScore(b, state.today) - routeScore(a, state.today))[0] ?? null;
}

/* ---------- Scores ---------- */

export const FIT_WEIGHTS = { regulated: 30, publishedAiAdoption: 30, enterpriseScale: 25, sensitiveData: 15 } as const;
export const PRIORITY_WEIGHTS = { fit: 0.4, timing: 0.35, route: 0.25 } as const;

/** coverage: share (0-1) of this component's weight that is backed by evidence. */
export type Score = { value: number | null; basis: string; coverage: number };

export function fitScore(a: Account): Score {
  let known = 0;
  let got = 0;
  const unknown: string[] = [];
  for (const [k, w] of Object.entries(FIT_WEIGHTS) as [keyof typeof FIT_WEIGHTS, number][]) {
    const v = a.fit[k];
    if (v === null) { unknown.push(k); continue; }
    known += w;
    if (v) got += w;
  }
  const coverage = known / 100;
  if (known < 50) return { value: null, coverage, basis: `Unknown: only ${known} of 100 weight points are evidenced.` };
  return { value: got, coverage, basis: `${got} of 100 points evidenced (${known} known)${unknown.length ? `; unknown, scored nothing: ${unknown.join(', ')}` : ''}.` };
}

export function timingScore(state: DeskState, accountId: string): Score {
  const s = bestSignal(state, accountId);
  if (!s) return { value: null, coverage: 0, basis: 'Unknown: no fresh, sourced signal.' };
  const v = judgeSignal(s, state.today);
  return { value: Math.round(s.relevance * 20 * (0.5 + 0.5 * v.freshness)), coverage: 1, basis: `Relevance ${s.relevance}/5 × freshness ${Math.round(v.freshness * 100)}% (${s.headline}).` };
}

export function routeReadiness(state: DeskState, accountId: string): Score {
  const r = bestRoute(state, accountId);
  if (!r) return { value: null, coverage: 0, basis: 'Unknown: no route candidate mapped.' };
  return { value: routeScore(r, state.today), coverage: 1, basis: `${basisLabel[r.basis]}${r.synthetic ? ' (synthetic)' : ''}: ${r.introducer}.` };
}

export type Priority = { value: number | null; coverage: number; unknown: string[]; parts: { fit: Score; timing: Score; route: Score }; reasons: string[] };

/**
 * Unknown parts contribute nothing and the known weights are not rescaled, so an
 * account with missing evidence can never outrank the same account with that evidence.
 * coverage is the share of the total weight that is evidenced.
 */
export function priority(state: DeskState, c: Campaign): Priority {
  const a = accountById(c.accountId);
  const parts = { fit: fitScore(a), timing: timingScore(state, a.id), route: routeReadiness(state, a.id) };
  let coverage = 0;
  let sum = 0;
  let anyKnown = false;
  const unknown: string[] = [];
  for (const k of ['fit', 'timing', 'route'] as const) {
    const v = parts[k].value;
    if (v === null) { unknown.push(k); continue; }
    anyKnown = true;
    coverage += PRIORITY_WEIGHTS[k] * parts[k].coverage;
    sum += PRIORITY_WEIGHTS[k] * v;
  }
  const reasons: string[] = [];
  if (parts.timing.value !== null && parts.timing.value >= 60) reasons.push('Fresh trigger');
  if (parts.route.value !== null && parts.route.value >= 80) reasons.push('Route ready to ask');
  if (parts.fit.value !== null && parts.fit.value >= 80) reasons.push('Strong fit');
  const f = campaignFlags(state, c);
  if (f.overdue) reasons.push('Overdue next step');
  if (parts.timing.value === null) reasons.push('No usable trigger');
  if (parts.route.value === null) reasons.push('No route mapped');
  return { value: anyKnown ? Math.round(sum) : null, coverage: Math.round(coverage * 100) / 100, unknown, parts, reasons };
}

/* ---------- Campaigns ---------- */

export const STAGES: Stage[] = ['map', 'route', 'brief', 'intro-prep', 'meeting-prep', 'engaged'];
export const stageLabel: Record<Stage, string> = {
  map: 'Map committee', route: 'Find route', brief: 'Brief', 'intro-prep': 'Intro prep', 'meeting-prep': 'Meeting prep', engaged: 'Engaged', stalled: 'Stalled', parked: 'Parked',
};

export const isActive = (c: Campaign) => c.stage !== 'parked';

export function campaignFlags(state: DeskState, c: Campaign) {
  const missingOwner = !c.ownerId;
  const missingNextStep = !c.nextAction || !c.nextActionDate;
  const overdue = !!c.nextActionDate && daysBetween(c.nextActionDate, state.today) > 0;
  const slaBreach = daysBetween(c.lastTouch, state.today) > c.slaDays;
  return { missingOwner, missingNextStep, overdue, slaBreach };
}

export function sellerLoad(state: DeskState, sellerId: string) {
  const seller = SELLERS.find((s) => s.id === sellerId)!;
  const active = state.campaigns.filter((c) => c.sellerId === sellerId && isActive(c)).length;
  return { active, capacity: seller.capacity, full: active >= seller.capacity };
}

export function committeeCoverage(state: DeskState, accountId: string) {
  const seats = state.stakeholders.filter((s) => s.accountId === accountId);
  const covered = seats.filter((s) => s.coverage !== 'unknown').length;
  return { covered, total: seats.length, unknown: seats.filter((s) => s.coverage === 'unknown') };
}

export type TransitionCheck = { ok: boolean; blockers: string[] };

export function canAdvance(state: DeskState, c: Campaign, to: Stage): TransitionCheck {
  const blockers: string[] = [];
  const flags = campaignFlags(state, c);
  if (to === 'parked') return { ok: c.stage !== 'parked', blockers: c.stage === 'parked' ? ['Already parked.'] : [] };
  if (c.stage === 'parked') {
    if (sellerLoad(state, c.sellerId).full) blockers.push(`Capacity overflow: ${SELLERS.find((s) => s.id === c.sellerId)!.label} already has ${sellerLoad(state, c.sellerId).active} of 3 active campaigns.`);
    if (to !== 'map') blockers.push('A parked campaign restarts at Map committee.');
    return { ok: blockers.length === 0, blockers };
  }
  if (c.stage === 'stalled') {
    if (flags.missingOwner) blockers.push('Assign an owner.');
    if (flags.missingNextStep) blockers.push('Add a dated next action.');
    if (flags.overdue) blockers.push('Next action date is in the past.');
    if (to !== (c.resumeStage ?? 'map')) blockers.push(`A stalled campaign resumes at ${stageLabel[c.resumeStage ?? 'map']}.`);
    return { ok: blockers.length === 0, blockers };
  }
  if (to === 'stalled') return { ok: true, blockers: [] };
  const from = STAGES.indexOf(c.stage);
  const target = STAGES.indexOf(to);
  if (target !== from + 1) return { ok: false, blockers: ['Stages move forward one step at a time.'] };
  if (flags.missingOwner) blockers.push('No owner.');
  if (flags.missingNextStep) blockers.push('No dated next action.');
  const cov = committeeCoverage(state, c.accountId);
  if (to === 'route' && cov.covered < 3) blockers.push(`Map at least 3 of ${cov.total} committee seats first (${cov.covered} mapped).`);
  if (to === 'brief' && !bestRoute(state, c.accountId)) blockers.push('No route candidate yet.');
  if (to === 'intro-prep') blockers.push(...briefReadiness(state, c).gaps);
  if (to === 'meeting-prep') {
    const r = c.introducerBriefRouteId ? state.routes.find((x) => x.id === c.introducerBriefRouteId) : bestRoute(state, c.accountId);
    if (!r) blockers.push('No route attached.');
    else blockers.push(...routeGate(r, state.today).blockers);
    if (!state.tickets.some((t) => t.campaignId === c.id && t.kind === 'intro-request')) blockers.push('Prepare the intro-request ticket first.');
  }
  if (to === 'engaged') blockers.push('Engaged is set from the CRM after a held meeting; this desk does not record meetings.');
  return { ok: blockers.length === 0, blockers };
}

export function advance(state: DeskState, id: string, to: Stage): DeskState {
  const c = state.campaigns.find((x) => x.id === id)!;
  const chk = canAdvance(state, c, to);
  if (!chk.ok) throw new Error(chk.blockers.join(' '));
  const next: Campaign = {
    ...c,
    stage: to,
    resumeStage: to === 'stalled' || to === 'parked' ? c.stage : null,
    failureReason: to === 'stalled' ? c.failureReason ?? 'Marked stalled by the desk.' : to === 'parked' ? 'Parked by the seller.' : null,
    lastTouch: state.today,
  };
  return withLog(replaceCampaign(state, next), `${accountById(c.accountId).name}: ${stageLabel[c.stage]} → ${stageLabel[to]}`);
}

export const replaceCampaign = (state: DeskState, c: Campaign): DeskState => ({ ...state, campaigns: state.campaigns.map((x) => (x.id === c.id ? c : x)) });
export const withLog = (state: DeskState, text: string): DeskState => ({ ...state, log: [{ at: state.today, text }, ...state.log].slice(0, 50) });

export function reminders(state: DeskState) {
  const out: { campaignId: string; tone: 'risk' | 'warn' | 'info'; text: string }[] = [];
  for (const c of state.campaigns.filter(isActive)) {
    const a = accountById(c.accountId).name;
    const f = campaignFlags(state, c);
    if (f.missingOwner) out.push({ campaignId: c.id, tone: 'risk', text: `${a}: no owner.` });
    if (f.missingNextStep) out.push({ campaignId: c.id, tone: 'risk', text: `${a}: no dated next step.` });
    if (f.overdue) out.push({ campaignId: c.id, tone: 'risk', text: `${a}: next step overdue by ${daysBetween(c.nextActionDate!, state.today)} days.` });
    if (f.slaBreach) out.push({ campaignId: c.id, tone: 'warn', text: `${a}: no touch for ${daysBetween(c.lastTouch, state.today)} days (SLA ${c.slaDays}).` });
    if (c.nextActionDate && !f.overdue && daysBetween(state.today, c.nextActionDate) <= 2) out.push({ campaignId: c.id, tone: 'info', text: `${a}: due ${fmtDate(c.nextActionDate)}.` });
  }
  return out;
}

/* ---------- Brief ---------- */

const ABBREV = /\b(?:[A-Z]\.){2,}|\b(?:Inc|Co|Corp|Ltd|vs|e\.g|i\.e|Mr|Ms|Dr|St)\./g;
export function splitSentences(text: string): string[] {
  const masked = text.replace(ABBREV, (m) => m.replace(/\./g, '\u2024'));
  return masked
    .split(/(?<=[.!?])\s+(?=["'“A-Z0-9])/)
    .map((s) => s.replace(/\u2024/g, '.').trim())
    .filter(Boolean);
}

export function validateBriefText(text: string): { ok: boolean; count: number; reason: string } {
  const parts = splitSentences(text.trim());
  const unterminated = text.trim() !== '' && !/[.!?]["”']?$/.test(text.trim());
  const count = parts.length;
  if (count !== 5) return { ok: false, count, reason: `A brief is exactly five sentences; this has ${count}.` };
  if (unterminated) return { ok: false, count, reason: 'The last sentence is not finished.' };
  return { ok: true, count, reason: 'Five sentences.' };
}

const UNSUPPORTED_CLAIM = /\b(knows|close (?:friend|to)|relationship with|will introduce|has agreed|warm intro(?:duction)? (?:confirmed|secured)|personal friend)\b/i;

export function targetStakeholder(state: DeskState, c: Campaign): Stakeholder | null {
  const r = bestRoute(state, c.accountId);
  const seats = state.stakeholders.filter((s) => s.accountId === c.accountId);
  return (r && seats.find((s) => s.id === r.targetStakeholderId)) || seats.find((s) => s.authority === 'decides') || null;
}

export function composeBrief(state: DeskState, c: Campaign): BriefDraft['sentences'] {
  const a = accountById(c.accountId);
  const sig = bestSignal(state, a.id);
  const st = targetStakeholder(state, c);
  const r = bestRoute(state, a.id);
  const gate = r ? routeGate(r, state.today) : null;
  const s1 = a.situation;
  const s2 = sig
    ? `Observed trigger: ${sig.headline.replace(/\.$/, '')}, per ${sig.sourceTitle} on ${fmtDate(sig.sourceDate)}${sig.sourceUrl ? ` (${sig.sourceUrl})` : ''}.`
    : 'Observed trigger: none is fresh and sourced yet, so there is no reason to reach out now.';
  const s3 = st
    ? `Hypothesis: the ${st.title}${st.publicName ? ` (${st.publicName}, as published${st.uncertain ? '; current role unverified' : ''})` : ''} is the likeliest sponsor because ${st.hypothesis}.`
    : 'Hypothesis: no sponsor has been identified on the buying committee yet.';
  const s4 = r
    ? `Best route: ${r.introducer}, rated ${basisLabel[r.basis].toLowerCase()}${gate!.ready ? ' and cleared to ask' : `, so no introduction is requested until it is verified`}.`
    : 'Best route: none mapped, and the desk will not draft a cold executive note.';
  const s5 =
    c.nextAction && c.ownerId && c.nextActionDate
      ? `Next: ${c.nextAction.replace(/\.$/, '')}, owned by ${personLabel(c.ownerId)}, due ${fmtDate(c.nextActionDate)}.`
      : 'Next: no owner and dated action are set yet.';
  return [s1, s2, s3, s4, s5];
}

export function currentBrief(state: DeskState, c: Campaign): BriefDraft {
  return state.briefs[c.id] ?? { campaignId: c.id, sentences: composeBrief(state, c), edited: false };
}

export function briefReadiness(state: DeskState, c: Campaign, draft = currentBrief(state, c)) {
  const gaps: string[] = [];
  const sig = bestSignal(state, c.accountId);
  const stale = state.signals.filter((s) => s.accountId === c.accountId && judgeSignal(s, state.today).status === 'stale');
  if (!sig) gaps.push(stale.length ? `Trigger is stale: ${stale[0].headline}.` : 'No sourced trigger.');
  if (!targetStakeholder(state, c)) gaps.push('No stakeholder hypothesis.');
  const r = bestRoute(state, c.accountId);
  if (!r) gaps.push('No route candidate.');
  if (!c.ownerId) gaps.push('No owner for the next action.');
  if (!c.nextAction || !c.nextActionDate) gaps.push('No dated next action.');
  draft.sentences.forEach((s, i) => {
    const n = splitSentences(s).length;
    if (n !== 1) gaps.push(`Sentence ${i + 1} must be one sentence (has ${n}).`);
  });
  const v = validateBriefText(draft.sentences.join(' '));
  if (!v.ok) gaps.push(v.reason);
  if (r && !routeGate(r, state.today).ready && UNSUPPORTED_CLAIM.test(draft.sentences.join(' ')))
    gaps.push('Brief claims a relationship the route ledger has not verified.');
  return { ready: gaps.length === 0, gaps };
}

/* ---------- Export ---------- */

export type ExportMode = 'internal' | 'share';

export function exportDesk(state: DeskState, mode: ExportMode): string {
  const lines: string[] = [
    `# Strategic Account Desk export (${mode === 'share' ? 'share mode' : 'internal'})`,
    `Desk date: ${state.today}. Independent concept by Ayo Ahmed. Not affiliated with or endorsed by Harmonic Security.`,
    'Synthetic fixtures are marked [SYNTHETIC]. Real-company rows are prospect hypotheses from public sources.',
    mode === 'share' ? 'Share mode removes internal route notes, introducer details and uncertain personal fields.' : 'Internal mode: do not forward.',
    '',
  ];
  for (const c of state.campaigns) {
    const a = accountById(c.accountId);
    const p = priority(state, c);
    lines.push(`## ${a.name}${a.synthetic ? ' [SYNTHETIC]' : ' [PUBLIC SOURCES · PROSPECT HYPOTHESIS]'}`);
    lines.push(`Seller: ${SELLERS.find((s) => s.id === c.sellerId)!.label} · Stage: ${stageLabel[c.stage]} · Priority: ${p.value ?? 'unknown'} · evidence coverage ${Math.round(p.coverage * 100)}%${p.unknown.length ? ` · unknown: ${p.unknown.join(', ')}` : ''} (fit ${p.parts.fit.value ?? 'unknown'}, timing ${p.parts.timing.value ?? 'unknown'}, route ${p.parts.route.value ?? 'unknown'})`);
    lines.push(`Next: ${c.nextAction ?? 'none'} · Owner: ${personLabel(c.ownerId) ?? 'none'} · Due: ${c.nextActionDate ?? 'none'}`);
    for (const s of state.stakeholders.filter((x) => x.accountId === a.id)) {
      const name = s.publicName && !(mode === 'share' && s.uncertain) ? ` (${s.publicName}, published)` : '';
      lines.push(`- Seat: ${s.title}${name} · authority ${s.authority} · coverage ${s.coverage}`);
    }
    for (const r of state.routes.filter((x) => x.accountId === a.id)) {
      const g = routeGate(r, state.today);
      lines.push(mode === 'share'
        ? `- Route: ${r.introducerKind} route · ${basisLabel[r.basis]} · ${g.ready ? 'cleared to ask' : 'blocked'}`
        : `- Route: ${r.introducer} · ${basisLabel[r.basis]} · ${g.ready ? 'cleared to ask' : `blocked: ${g.blockers.join(' ')}`} · Note: ${r.internalNote}`);
    }
    for (const e of state.evidence.filter((x) => x.accountId === a.id)) {
      lines.push(`- Evidence [${e.kind}, ${e.confidence}, ${e.provenance}]: ${e.sentence} Source: ${e.sourceUrl ?? e.sourceTitle} (event ${e.eventDate}, accessed ${e.accessed})`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function exportBrief(state: DeskState, c: Campaign, mode: ExportMode): string {
  const a = accountById(c.accountId);
  const d = currentBrief(state, c);
  const r = briefReadiness(state, c, d);
  let sentences = [...d.sentences];
  if (mode === 'share') {
    const uncertain = state.stakeholders.filter((s) => s.accountId === a.id && s.uncertain && s.publicName).map((s) => s.publicName!);
    sentences = sentences.map((s) => uncertain.reduce((acc, n) => acc.split(n).join('[name withheld: role unverified]'), s));
  }
  return [
    `${a.name}${a.synthetic ? ' [SYNTHETIC]' : ' [PUBLIC SOURCES · PROSPECT HYPOTHESIS]'}: five-sentence brief`,
    r.ready ? 'Status: ready to brief' : `Status: blocked (${r.gaps.join(' ')})`,
    '',
    ...sentences.map((s, i) => `${i + 1}. ${s}`),
    '',
    'Prepared on the desk only. Nothing was sent.',
  ].join('\n');
}

export function prepTicket(state: DeskState, c: Campaign, kind: 'intro-request' | 'event-invite'): { ok: boolean; blockers: string[]; state: DeskState } {
  const r = c.introducerBriefRouteId ? state.routes.find((x) => x.id === c.introducerBriefRouteId) ?? null : bestRoute(state, c.accountId);
  const blockers: string[] = [];
  if (kind === 'intro-request') {
    if (!r) blockers.push('No route attached.');
    else blockers.push(...routeGate(r, state.today).blockers);
    blockers.push(...briefReadiness(state, c).gaps);
  }
  if (kind === 'event-invite' && !c.eventPlan) blockers.push('No event or roundtable planned.');
  if (blockers.length) return { ok: false, blockers, state };
  const a = accountById(c.accountId);
  const body =
    kind === 'intro-request'
      ? `PREPARATION TICKET (not sent). Ask ${r!.introducer} whether they would introduce ${a.name}'s ${targetStakeholder(state, c)?.title ?? 'sponsor'} to ${SELLERS.find((s) => s.id === c.sellerId)!.label}. Attach the five-sentence brief. Owner: ${personLabel(c.ownerId)}. Due ${c.nextActionDate}.`
      : `PREPARATION TICKET (not sent). Hold a seat for ${a.name} at: ${c.eventPlan}. Events lead confirms the guest list; no invite leaves the desk.`;
  const ticket = { id: `t-${state.tickets.length + 1}`, campaignId: c.id, kind, createdOn: state.today, body };
  let next: DeskState = { ...state, tickets: [ticket, ...state.tickets] };
  if (kind === 'intro-request' && r) next = { ...next, routes: next.routes.map((x) => (x.id === r.id ? { ...x, lastAskedOn: state.today } : x)) };
  return { ok: true, blockers: [], state: withLog(next, `${a.name}: ${kind} ticket prepared (not sent)`) };
}

/* ---------- Metrics ---------- */

export const METRIC_WINDOW_DAYS = 28;
export type Metric = { id: string; label: string; num: number | null; den: number | null; window: string; kind: 'simulated' | 'crm-dependent'; note: string };

export function metrics(state: DeskState): Metric[] {
  const active = state.campaigns.filter(isActive);
  const windowStart = addDays(state.today, -METRIC_WINDOW_DAYS);
  const window = `${windowStart} to ${state.today}`;
  const seats = state.stakeholders.filter((s) => active.some((c) => c.accountId === s.accountId));
  const sigs = state.signals.filter((s) => active.some((c) => c.accountId === s.accountId));
  const routes = state.routes.filter((r) => active.some((c) => c.accountId === r.accountId));
  const touched = active.filter((c) => daysBetween(c.lastTouch, state.today) <= c.slaDays);
  return [
    { id: 'owned', label: 'Active campaigns with an owner and dated next step', num: active.filter((c) => { const f = campaignFlags(state, c); return !f.missingOwner && !f.missingNextStep; }).length, den: active.length, window: `as of ${state.today}`, kind: 'simulated', note: 'Denominator: active (non-parked) campaigns.' },
    { id: 'sla', label: 'Active campaigns touched within their SLA', num: touched.length, den: active.length, window: `as of ${state.today}`, kind: 'simulated', note: 'Touch = any logged desk action.' },
    { id: 'seats', label: 'Buying-committee seats mapped', num: seats.filter((s) => s.coverage !== 'unknown').length, den: seats.length, window: `as of ${state.today}`, kind: 'simulated', note: 'Five seats per active account. Unknown is not counted as mapped.' },
    { id: 'signals', label: 'Signals usable as a why-now trigger', num: sigs.filter((s) => judgeSignal(s, state.today).status === 'usable').length, den: sigs.length, window: `sources dated before ${state.today}`, kind: 'simulated', note: 'Stale and unsupported signals stay in the denominator.' },
    { id: 'routes', label: 'Routes cleared to request an introduction', num: routes.filter((r) => routeGate(r, state.today).ready).length, den: routes.length, window: `as of ${state.today}`, kind: 'simulated', note: 'Cleared = verified relationship, permission and recipient, outside cooldown.' },
    { id: 'briefs', label: 'Active campaigns with a ready five-sentence brief', num: active.filter((c) => briefReadiness(state, c).ready).length, den: active.length, window: `as of ${state.today}`, kind: 'simulated', note: 'Ready = no evidence gaps.' },
    { id: 'tickets', label: 'Preparation tickets created', num: state.tickets.filter((t) => t.createdOn >= windowStart).length, den: null, window, kind: 'simulated', note: 'Count only; tickets are prepared, never sent.' },
    { id: 'meetings', label: 'Executive meetings sourced', num: null, den: null, window, kind: 'crm-dependent', note: 'Not measured: needs CRM meeting records. The desk does not invent this.' },
    { id: 'pipeline', label: 'Pipeline influenced', num: null, den: null, window, kind: 'crm-dependent', note: 'Not measured: needs CRM opportunity data. No revenue or ROI is claimed.' },
  ];
}
