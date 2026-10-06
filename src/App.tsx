import { useEffect, useMemo, useState } from 'react';
import { ACCOUNTS, PEOPLE, SELLERS } from './domain/fixtures';
import {
  FIT_WEIGHTS, PRIORITY_WEIGHTS, STAGES, accountById, addDays, advance, basisLabel, briefReadiness, campaignFlags, canAdvance,
  committeeCoverage, currentBrief, dedupeSignals, exportBrief, exportDesk, fmtDate, isActive, judgeSignal, metrics,
  personLabel, prepTicket, priority, reminders, replaceCampaign, routeGate, routeScore, sellerLoad, splitSentences, stageLabel, withLog,
} from './domain/logic';
import type { ExportMode } from './domain/logic';
import { load, reset, save } from './domain/store';
import { runTrustTests } from './domain/trust';
import type { Campaign, DeskState, Signal, SignalType, Stage } from './domain/types';
import { Pill, ProvenanceChip, ScoreBar, Section, copy, download } from './ui/bits';
import type { Tone } from './ui/bits';

type View = 'desk' | 'account' | 'routes' | 'signals' | 'brief' | 'momentum' | 'trust' | 'value';
const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'desk', label: 'Weekly desk', icon: 'M4 5h16v4H4zM4 11h7v8H4zM13 11h7v8h-7z' },
  { id: 'account', label: 'Account map', icon: 'M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM5 14a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM19 14a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM12 10v3M7 15l4-2M17 15l-4-2' },
  { id: 'routes', label: 'Warm routes', icon: 'M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 16c5 0 5-8 10-8' },
  { id: 'signals', label: 'Signals', icon: 'M4 12h3l2-6 4 12 2-6h5' },
  { id: 'brief', label: 'Brief', icon: 'M6 4h9l3 3v13H6zM9 10h6M9 13h6M9 16h4' },
  { id: 'momentum', label: 'Momentum', icon: 'M4 18l5-6 4 3 7-9M15 6h5v5' },
  { id: 'trust', label: 'Trust & metrics', icon: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z M9 12l2 2 4-4' },
  { id: 'value', label: 'Why & 30 days', icon: 'M12 3v18M5 8h14M7 14h10' },
];

function readHash(): { view: View; arg: string | null } {
  const [, v, arg] = window.location.hash.split('/');
  const view = (NAV.some((n) => n.id === v) ? v : 'desk') as View;
  return { view, arg: arg ? decodeURIComponent(arg) : null };
}
const go = (view: View, arg?: string) => { window.location.hash = `/${view}${arg ? `/${encodeURIComponent(arg)}` : ''}`; };

export function App() {
  const [state, setState] = useState<DeskState>(() => load());
  const [route, setRoute] = useState(readHash);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => save(state), [state]);
  useEffect(() => {
    const on = () => { setRoute(readHash()); window.scrollTo(0, 0); document.getElementById('main')?.focus({ preventScroll: true }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const say = (t: string) => setToast(t);
  const props = { state, setState, say, arg: route.arg };

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <a className="brand" href="#/desk" aria-label="Strategic Account Desk home">
          <img src="./assets/brand/Harmonic-Logo-White.svg" alt="Harmonic Security" width="132" height="28" />
          <span className="brand-sep" aria-hidden="true" />
          <span className="brand-title">Strategic Account Desk</span>
        </a>
        <p className="notice">Independent concept by Ayo Ahmed. Not affiliated with or endorsed by Harmonic Security.</p>
        <div className="top-actions">
          <span className="desk-date">Desk date <strong>{fmtDate(state.today)}</strong></span>
          <ExportMenu state={state} say={say} />
          <button
            className="btn btn-ghost-dark"
            onClick={() => { if (window.confirm('Reset the demo? This clears every local change.')) { setState(reset()); say('Demo reset to the seeded desk.'); } }}
          >Reset demo</button>
        </div>
      </header>
      <nav className="rail" aria-label="Desk sections">
        {NAV.map((n) => (
          <a key={n.id} href={`#/${n.id}`} className="rail-item" aria-current={route.view === n.id ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={n.icon} /></svg>
            <span>{n.label}</span>
          </a>
        ))}
      </nav>
      <div className="strip" role="note">
        <svg className="strip-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg> Synthetic fixtures are marked <Pill tone="syn">Synthetic</Pill>. <span className="strip-long">JPMorganChase uses public sources only and is a prospect hypothesis, not a customer. Nothing on this desk is ever sent: every action is a preparation ticket. State lives in this browser only.</span><span className="strip-short">JPMorganChase: public sources, prospect hypothesis. Nothing is ever sent; state stays in this browser.</span>
      </div>
      <main id="main" tabIndex={-1} className="main">
        {route.view === 'desk' && <DeskView {...props} />}
        {route.view === 'account' && <AccountView {...props} />}
        {route.view === 'routes' && <RoutesView {...props} />}
        {route.view === 'signals' && <SignalsView {...props} />}
        {route.view === 'brief' && <BriefView {...props} />}
        {route.view === 'momentum' && <MomentumView {...props} />}
        {route.view === 'trust' && <TrustView {...props} />}
        {route.view === 'value' && <ValueView />}
      </main>
      <div className="toast" role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

type P = { state: DeskState; setState: (s: DeskState | ((p: DeskState) => DeskState)) => void; say: (t: string) => void; arg: string | null };

function ExportMenu({ state, say }: { state: DeskState; say: (t: string) => void }) {
  const [mode, setMode] = useState<ExportMode>('share');
  return (
    <div className="export">
      <label className="sr-only" htmlFor="export-mode">Export mode</label>
      <select id="export-mode" value={mode} onChange={(e) => setMode(e.target.value as ExportMode)}>
        <option value="share">Share mode</option>
        <option value="internal">Internal</option>
      </select>
      <button className="btn btn-lime" onClick={() => { download(`account-desk-${mode}-${state.today}.md`, exportDesk(state, mode)); say(`Exported desk (${mode === 'share' ? 'share mode: internal notes stripped' : 'internal'}).`); }}>
        Export
      </button>
    </div>
  );
}

function PageTitle({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      <p>{lede}</p>
    </div>
  );
}

const stageTone = (s: Stage): Tone => (s === 'stalled' ? 'risk' : s === 'parked' ? 'muted' : s === 'meeting-prep' || s === 'engaged' ? 'ok' : 'info');

/* ------------------------------ Weekly desk ------------------------------ */

function DeskView({ state, setState, say }: P) {
  const rem = reminders(state);
  const active = state.campaigns.filter(isActive).length;
  const cap = SELLERS.reduce((n, s) => n + s.capacity, 0);
  return (
    <>
      <PageTitle title="This week" lede={`${active} of ${cap} campaign slots active across three sellers. Ranked by fit, timing and route readiness, shown separately. Unknown stays unknown.`} />
      <div className="lanes">
        {SELLERS.map((s) => {
          const load = sellerLoad(state, s.id);
          const list = state.campaigns
            .filter((c) => c.sellerId === s.id)
            .sort((a, b) => Number(isActive(b)) - Number(isActive(a)) || (priority(state, b).value ?? -1) - (priority(state, a).value ?? -1));
          return (
            <section key={s.id} className="lane" aria-labelledby={`lane-${s.id}`}>
              <div className="lane-head">
                <div>
                  <h2 id={`lane-${s.id}`}>{s.label}</h2>
                  <p className="kicker">{s.territory}</p>
                </div>
                <div className={`capacity ${load.full ? 'is-full' : ''}`} aria-label={`${load.active} of ${load.capacity} active campaigns`}>
                  {Array.from({ length: load.capacity }, (_, i) => <span key={i} className={i < load.active ? 'on' : ''} />)}
                  <strong>{load.active}/{load.capacity}</strong>
                </div>
              </div>
              {list.map((c) => <CampaignCard key={c.id} c={c} state={state} setState={setState} say={say} />)}
            </section>
          );
        })}
      </div>
      <div className="grid-2">
        <Section title="Local reminders" kicker="Simulated in this browser. No calendar or email is touched." id="rem">
          {rem.length === 0 ? <p>Nothing due.</p> : (
            <ul className="list">
              {rem.map((r, i) => <li key={i}><Pill tone={r.tone}>{r.tone === 'risk' ? 'Fix' : r.tone === 'warn' ? 'SLA' : 'Due'}</Pill> <a href={`#/momentum/${r.campaignId}`}>{r.text}</a></li>)}
            </ul>
          )}
        </Section>
        <Section title="How priority is scored" kicker="Weights are fixed and visible. Missing components are left out, not scored zero." id="weights">
          <ul className="list">
            <li><strong>Priority</strong> = fit ×{PRIORITY_WEIGHTS.fit} + timing ×{PRIORITY_WEIGHTS.timing} + route ×{PRIORITY_WEIGHTS.route}, averaged over known parts.</li>
            <li><strong>Fit</strong>: regulated {FIT_WEIGHTS.regulated}, published AI adoption {FIT_WEIGHTS.publishedAiAdoption}, enterprise scale {FIT_WEIGHTS.enterpriseScale}, sensitive data {FIT_WEIGHTS.sensitiveData}. Under 50 evidenced points is Unknown.</li>
            <li><strong>Timing</strong>: best usable signal, relevance × 20 × (0.5 + 0.5 × freshness). Stale or unsourced signals score nothing.</li>
            <li><strong>Route</strong>: verified 40, public affiliation 15, hypothesis 5; +20 each for relationship, permission and recipient; −30 in the 30-day ask cooldown.</li>
          </ul>
        </Section>
      </div>
    </>
  );
}

function CampaignCard({ c, state, setState, say }: { c: Campaign } & Omit<P, 'arg'>) {
  const a = accountById(c.accountId);
  const p = priority(state, c);
  const f = campaignFlags(state, c);
  const parked = c.stage === 'parked';
  return (
    <article className={`camp ${c.stage === 'stalled' ? 'is-stalled' : ''} ${parked ? 'is-parked' : ''}`} aria-label={a.name}>
      <div className="camp-top">
        <a className="camp-name" href={`#/account/${a.id}`}>{a.name}</a>
        <span className="prio" aria-label={`Priority ${p.value ?? 'unknown'}`}>{p.value ?? '?'}</span>
      </div>
      <div className="chips">
        <ProvenanceChip synthetic={a.synthetic} />
        <Pill tone={stageTone(c.stage)}>{stageLabel[c.stage]}</Pill>
        {!parked && f.missingOwner && <Pill tone="risk">No owner</Pill>}
        {!parked && f.missingNextStep && <Pill tone="risk">No next step</Pill>}
        {!parked && f.overdue && <Pill tone="risk">Overdue</Pill>}
        {!parked && f.slaBreach && <Pill tone="warn">SLA breach</Pill>}
      </div>
      {!parked && (
        <div className="scores">
          <ScoreBar label="Fit" score={p.parts.fit} weight={PRIORITY_WEIGHTS.fit} />
          <ScoreBar label="Timing" score={p.parts.timing} weight={PRIORITY_WEIGHTS.timing} />
          <ScoreBar label="Route" score={p.parts.route} weight={PRIORITY_WEIGHTS.route} />
        </div>
      )}
      {p.reasons.length > 0 && !parked && <p className="reasons">{p.reasons.join(' · ')}</p>}
      <dl className="meta">
        <div><dt>Owner</dt><dd>{personLabel(c.ownerId) ?? <em>Unassigned</em>}</dd></div>
        <div><dt>Next</dt><dd>{c.nextAction ?? <em>None</em>}</dd></div>
        <div><dt>Due</dt><dd>{c.nextActionDate ? fmtDate(c.nextActionDate) : <em>No date</em>}</dd></div>
      </dl>
      {c.failureReason && <p className="failure">{c.failureReason}</p>}
      {parked ? <ParkedControls c={c} state={state} setState={setState} say={say} /> : (
        <div className="camp-actions">
          <a className="btn btn-small" href={`#/brief/${c.id}`}>Brief</a>
          <a className="btn btn-small" href={`#/momentum/${c.id}`}>{c.stage === 'stalled' ? 'Fix stall' : 'Momentum'}</a>
        </div>
      )}
    </article>
  );
}

function ParkedControls({ c, state, setState, say }: { c: Campaign } & Omit<P, 'arg'>) {
  const chk = canAdvance(state, c, 'map');
  return (
    <div className="parked">
      <button className="btn btn-small" aria-describedby={`why-${c.id}`} onClick={() => {
        if (!chk.ok) { say(`Blocked: ${chk.blockers.join(' ')}`); return; }
        setState(advance(state, c.id, 'map')); say(`${accountById(c.accountId).name} reactivated.`);
      }}>Reactivate</button>
      <label className="inline">
        <span>Move to</span>
        <select value={c.sellerId} onChange={(e) => {
          setState(withLog(replaceCampaign(state, { ...c, sellerId: e.target.value }), `${accountById(c.accountId).name} moved to ${SELLERS.find((s) => s.id === e.target.value)!.label}`));
          say('Moved. Reactivate when the lane has room.');
        }}>
          {SELLERS.map((s) => <option key={s.id} value={s.id}>{s.label} ({sellerLoad(state, s.id).active}/{s.capacity})</option>)}
        </select>
      </label>
      {!chk.ok && <p id={`why-${c.id}`} className="blocked-text">{chk.blockers[0]}</p>}
    </div>
  );
}

/* ------------------------------ Account map ------------------------------ */

function AccountPicker({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  return (
    <div className="picker" role="group" aria-label="Choose account">
      {ACCOUNTS.map((a) => (
        <button key={a.id} className={`chip-btn ${current === a.id ? 'is-on' : ''}`} aria-pressed={current === a.id} onClick={() => onPick(a.id)}>
          {a.name}{a.synthetic ? '' : ' ★'}
        </button>
      ))}
    </div>
  );
}

function AccountView({ state, arg }: P) {
  const a = accountById(ACCOUNTS.some((x) => x.id === arg) ? arg! : 'jpmc');
  const seats = state.stakeholders.filter((s) => s.accountId === a.id);
  const cov = committeeCoverage(state, a.id);
  const ev = state.evidence.filter((e) => e.accountId === a.id);
  return (
    <>
      <PageTitle title="Account map" lede="Who decides, who influences, what we know and how we know it. ★ marks the real public-evidence account." />
      <AccountPicker current={a.id} onPick={(id) => go('account', id)} />
      <Section title={a.name} id="acct" kicker={<><ProvenanceChip synthetic={a.synthetic} /> {a.sector} · {a.profile}</>}>
        <p className="situation">{a.situation}</p>
      </Section>
      <Section title="Buying committee" id="committee" kicker={`${cov.covered} of ${cov.total} seats mapped. Names appear only when the account itself publishes them.`}>
        <div className="rows">
          <div className="row row-head committee" aria-hidden="true"><span>Seat</span><span>Authority</span><span>Coverage</span><span>Why this seat (hypothesis)</span></div>
          {seats.map((s) => (
            <div className="row committee" key={s.id}>
              <span><strong>{s.title}</strong>{s.publicName && <><br />{s.publicName} <small className="muted">published{s.uncertain ? '; current role unverified' : ''}</small></>}</span>
              <span><Pill tone={s.authority === 'decides' ? 'ok' : s.authority === 'influences' ? 'info' : 'muted'}>{s.authority === 'decides' ? 'Decides' : s.authority === 'influences' ? 'Influences' : 'Unknown'}</Pill></span>
              <span><Pill tone={s.coverage === 'engaged' ? 'ok' : s.coverage === 'mapped' ? 'info' : 'warn'}>{s.coverage === 'unknown' ? 'Unknown' : s.coverage === 'mapped' ? 'Mapped' : 'Engaged'}</Pill></span>
              <span>{s.hypothesis[0].toUpperCase() + s.hypothesis.slice(1)}.</span>
            </div>
          ))}
        </div>
        {cov.unknown.length > 0 && <p className="unknowns"><strong>Unknowns:</strong> {cov.unknown.map((u) => u.title).join('; ')}.</p>}
      </Section>
      <Section title="Evidence ledger" id="ledger" kicker="Every claim carries its source, date, confidence and provenance. Hypotheses are labelled as such.">
        <ol className="ledger">
          {ev.map((e) => (
            <li key={e.id}>
              <p>{e.sentence}</p>
              <div className="chips">
                <Pill tone={e.kind === 'observed-fact' ? 'ok' : 'warn'}>{e.kind === 'observed-fact' ? 'Observed fact' : 'Hypothesis'}</Pill>
                <Pill tone={e.confidence === 'high' ? 'ok' : e.confidence === 'medium' ? 'info' : 'warn'}>Confidence {e.confidence}</Pill>
                <Pill tone={e.provenance === 'synthetic-fixture' ? 'syn' : e.provenance === 'public-source' ? 'real' : 'muted'}>{e.provenance.replace('-', ' ')}</Pill>
                <span className="muted small">Event {fmtDate(e.eventDate)} · accessed {fmtDate(e.accessed)}</span>
              </div>
              <p className="small">{e.sourceUrl ? <a href={e.sourceUrl} target="_blank" rel="noreferrer noopener">{e.sourceTitle}</a> : e.sourceTitle}{e.note ? ` · ${e.note}` : ''}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

/* ------------------------------ Warm routes ------------------------------ */

function RoutesView({ state, setState, say }: P) {
  const sorted = [...state.routes].sort((a, b) => routeScore(b, state.today) - routeScore(a, state.today));
  return (
    <>
      <PageTitle title="Warm routes" lede="A shared investor, board seat or event is not an introduction. A route is cleared to ask only when the relationship, the introducer's permission and the recipient are all verified." />
      <div className="route-list">
        {sorted.map((r) => {
          const a = accountById(r.accountId);
          const g = routeGate(r, state.today);
          const c = state.campaigns.find((x) => x.accountId === r.accountId);
          const target = state.stakeholders.find((s) => s.id === r.targetStakeholderId);
          const toggle = (k: 'relationshipVerified' | 'introducerPermission' | 'recipientConfirmed') =>
            setState(withLog({ ...state, routes: state.routes.map((x) => (x.id === r.id ? { ...x, [k]: !x[k] } : x)) }, `${a.name}: route check "${k}" toggled`));
          return (
            <article key={r.id} className={`card route ${g.ready ? 'is-ready' : ''}`} aria-label={`${a.name} route`}>
              <div className="card-head">
                <div>
                  <h2>{a.name} <span className="muted">→ {target?.title}</span></h2>
                  <p className="kicker">{r.introducer} · {r.introducerKind}</p>
                </div>
                <div className="chips">
                  <Pill tone={r.basis === 'verified-relationship' ? 'ok' : r.basis === 'public-affiliation' ? 'warn' : 'muted'}>{basisLabel[r.basis]}</Pill>
                  {r.synthetic ? <Pill tone="syn">Synthetic demo</Pill> : <Pill tone="real">Public sources</Pill>}
                  <Pill tone={g.ready ? 'ok' : 'risk'}>{g.ready ? 'Cleared to ask' : 'Blocked'}</Pill>
                  <span className="prio small-prio" aria-label={`Route score ${routeScore(r, state.today)}`}>{routeScore(r, state.today)}</span>
                </div>
              </div>
              <fieldset className="checks">
                <legend className="sr-only">Verification checks</legend>
                {([['relationshipVerified', 'Relationship verified'], ['introducerPermission', 'Introducer permission'], ['recipientConfirmed', 'Recipient confirmed']] as const).map(([k, label]) => (
                  <label key={k} className={`check ${r[k] ? 'on' : ''}`}>
                    <input type="checkbox" checked={r[k]} disabled={!r.synthetic} onChange={() => toggle(k)} />
                    <span>{label}</span>
                  </label>
                ))}
                {!r.synthetic && <p className="small muted">Real-account checks are locked: they cannot be verified from public sources.</p>}
              </fieldset>
              <p className="small"><strong>Internal note:</strong> {r.internalNote} <span className="muted">(stripped in share mode)</span></p>
              {!g.ready && <ul className="blockers">{g.blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
              <div className="camp-actions">
                <button className="btn btn-small" onClick={() => {
                  if (!c) return;
                  const res = prepTicket(state, c, 'intro-request');
                  if (!res.ok) say(`Intro request blocked: ${res.blockers[0]}`);
                  else { setState(res.state); say('Preparation ticket created. Nothing was sent.'); }
                }}>Prepare intro request</button>
                {c && <a className="btn btn-small btn-quiet" href={`#/brief/${c.id}`}>Open brief</a>}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------ Signals ------------------------------ */

const SIGNAL_TYPES: SignalType[] = ['leadership', 'ai-initiative', 'regulatory', 'event', 'news'];

function SignalsView({ state, setState, say }: P) {
  const [type, setType] = useState<SignalType | 'all'>('all');
  const [form, setForm] = useState({ accountId: 'jpmc', type: 'news' as SignalType, headline: '', sourceUrl: '', sourceDate: state.today, relevance: 3, shelfLifeDays: 60 });
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const list = state.signals.filter((s) => type === 'all' || s.type === type);
  const statusTone = { usable: 'ok', stale: 'risk', unsupported: 'risk', future: 'warn' } as const;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = form.sourceUrl.trim();
    if (!form.headline.trim()) { setFormMsg('Add a headline.'); return; }
    if (url && !/^https:\/\/[^\s]+$/.test(url)) { setFormMsg('Source must be an https URL.'); return; }
    const sig: Signal = {
      id: `sg-user-${Date.now()}`, accountId: form.accountId, type: form.type, headline: form.headline.trim(),
      sourceTitle: url ? new URL(url).hostname : 'Seller note (no source)', sourceUrl: url || null, sourceDate: form.sourceDate,
      relevance: Math.min(5, Math.max(1, form.relevance)) as Signal['relevance'], shelfLifeDays: form.shelfLifeDays,
      provenance: url ? 'public-source' : 'analyst-hypothesis',
      whyNow: 'Added on the desk; review before use.', followOn: 'Check the source and attach to a brief.',
    };
    const d = dedupeSignals([...state.signals, sig]);
    if (d.dropped.length) { setFormMsg('Duplicate: this account already has that signal from that source. Not added.'); return; }
    const v = judgeSignal(sig, state.today);
    setState(withLog({ ...state, signals: [...state.signals, sig] }, `Signal added for ${accountById(sig.accountId).name}: ${v.status}`));
    setFormMsg(v.status === 'usable' ? 'Added and usable as a trigger.' : `Added, but rejected as a trigger: ${v.reason}`);
    say('Signal stored as data. It is never run as an instruction.');
  };

  return (
    <>
      <PageTitle title="Signal desk" lede="Leadership, AI initiative, regulatory, event and news signals with dates, expiry and why-now. Stale and unsourced signals are kept visible but cannot drive outreach." />
      <div className="picker" role="group" aria-label="Filter by signal type">
        {(['all', ...SIGNAL_TYPES] as const).map((t) => (
          <button key={t} className={`chip-btn ${type === t ? 'is-on' : ''}`} aria-pressed={type === t} onClick={() => setType(t)}>{t === 'all' ? 'All signals' : t.replace('-', ' ')}</button>
        ))}
      </div>
      <div className="signal-list">
        {list.map((s) => {
          const v = judgeSignal(s, state.today);
          const a = accountById(s.accountId);
          return (
            <article key={s.id} className={`card signal ${s.provenance === 'synthetic-fixture' ? 'is-syn' : ''}`} aria-label={s.headline}>
              <div className="chips">
                <Pill tone={statusTone[v.status]}>{v.status === 'usable' ? 'Usable' : v.status === 'stale' ? 'Stale' : v.status === 'unsupported' ? 'Unsupported' : 'Future-dated'}</Pill>
                <Pill tone={s.provenance === 'synthetic-fixture' ? 'syn' : s.provenance === 'public-source' ? 'real' : 'muted'}>{s.provenance === 'public-source' ? 'Public fact' : s.provenance === 'synthetic-fixture' ? 'Synthetic fixture' : 'Unsourced'}</Pill>
                <Pill tone="info">{s.type.replace('-', ' ')}</Pill>
                <span className="small muted">Relevance {s.relevance}/5</span>
              </div>
              <h2 className="signal-h">{s.headline}</h2>
              <p className="small"><strong>{a.name}</strong> · {s.sourceUrl ? <a href={s.sourceUrl} target="_blank" rel="noreferrer noopener">{s.sourceTitle}</a> : s.sourceTitle} · dated {fmtDate(s.sourceDate)} · {v.reason}</p>
              <p><strong>Why now:</strong> {s.whyNow}</p>
              <p><strong>Follow-on:</strong> {s.followOn}</p>
            </article>
          );
        })}
      </div>
      <Section title="Add a signal" id="add-signal" kicker="Without a source URL it is stored as an unsourced note and cannot be a trigger. Duplicates are refused.">
        <form className="form" onSubmit={submit}>
          <label>Account<select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>{ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SignalType })}>{SIGNAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
          <label className="wide">Headline<input value={form.headline} maxLength={200} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></label>
          <label className="wide">Source URL (https)<input value={form.sourceUrl} inputMode="url" onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} /></label>
          <label>Source date<input type="date" value={form.sourceDate} onChange={(e) => setForm({ ...form, sourceDate: e.target.value })} /></label>
          <label>Relevance (1–5)<input type="number" min={1} max={5} value={form.relevance} onChange={(e) => setForm({ ...form, relevance: Number(e.target.value) })} /></label>
          <label>Shelf life (days)<input type="number" min={1} max={365} value={form.shelfLifeDays} onChange={(e) => setForm({ ...form, shelfLifeDays: Number(e.target.value) })} /></label>
          <div className="wide"><button className="btn btn-dark" type="submit">Add signal</button> {formMsg && <span role="status" className="form-msg">{formMsg}</span>}</div>
        </form>
      </Section>
    </>
  );
}

/* ------------------------------ Brief ------------------------------ */

const BRIEF_LABELS = ['Account situation', 'Observed trigger, with source', 'Stakeholder hypothesis', 'Credible route, with uncertainty', 'Next action, owner and date'];

function CampaignPicker({ state, current, view }: { state: DeskState; current: string; view: View }) {
  return (
    <div className="picker" role="group" aria-label="Choose campaign">
      {state.campaigns.filter(isActive).map((c) => {
        const a = accountById(c.accountId);
        return <button key={c.id} className={`chip-btn ${current === c.id ? 'is-on' : ''}`} aria-pressed={current === c.id} onClick={() => go(view, c.id)}>{a.name}{a.synthetic ? '' : ' ★'}</button>;
      })}
    </div>
  );
}

function BriefView({ state, setState, say, arg }: P) {
  const c = state.campaigns.find((x) => x.id === arg && isActive(x)) ?? state.campaigns[0];
  const a = accountById(c.accountId);
  const draft = currentBrief(state, c);
  const ready = briefReadiness(state, c, draft);
  const [mode, setMode] = useState<ExportMode>('share');
  const text = exportBrief(state, c, mode);
  const edit = (i: number, v: string) => {
    const sentences = [...draft.sentences] as typeof draft.sentences;
    sentences[i] = v;
    setState({ ...state, briefs: { ...state.briefs, [c.id]: { campaignId: c.id, sentences, edited: true } } });
  };
  return (
    <>
      <PageTitle title="Five-sentence brief" lede="Exactly five sentences: situation, sourced trigger, stakeholder hypothesis, route with its uncertainty, and a dated next step with an owner. Edit freely; the gate re-checks every keystroke." />
      <CampaignPicker state={state} current={c.id} view="brief" />
      <Section title={a.name} id="brief-h" kicker={<><ProvenanceChip synthetic={a.synthetic} /> <Pill tone={ready.ready ? 'ok' : 'risk'}>{ready.ready ? 'Ready to brief' : 'Blocked'}</Pill></>}
        actions={<>
          <button className="btn btn-small btn-quiet" onClick={() => { const { [c.id]: _drop, ...rest } = state.briefs; void _drop; setState({ ...state, briefs: rest }); say('Brief recomposed from the evidence.'); }}>Recompose</button>
        </>}>
        <ol className="brief">
          {draft.sentences.map((s, i) => {
            const n = splitSentences(s).length;
            return (
              <li key={i}>
                <label htmlFor={`s${i}`}>{i + 1}. {BRIEF_LABELS[i]} {n !== 1 && <Pill tone="risk">{n} sentences</Pill>}</label>
                <textarea id={`s${i}`} rows={2} value={s} onChange={(e) => edit(i, e.target.value)} />
              </li>
            );
          })}
        </ol>
        {!ready.ready && (
          <div className="gaps" role="alert">
            <strong>Evidence gaps before this can be briefed:</strong>
            <ul>{ready.gaps.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>
        )}
        <div className="export-row">
          <label className="inline"><span>Output</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as ExportMode)}>
              <option value="share">Share mode (strips uncertain names)</option>
              <option value="internal">Internal</option>
            </select>
          </label>
          <button className="btn btn-dark" onClick={async () => say((await copy(text)) ? 'Brief copied.' : 'Copy blocked by the browser; use Download.')}>Copy brief</button>
          <button className="btn" onClick={() => { download(`brief-${a.id}-${mode}.md`, text); say('Brief downloaded.'); }}>Download .md</button>
        </div>
        <pre className="preview" aria-label="Brief export preview">{text}</pre>
      </Section>
    </>
  );
}

/* ------------------------------ Momentum ------------------------------ */

function MomentumView({ state, setState, say, arg }: P) {
  const stalled = state.campaigns.find((x) => x.stage === 'stalled');
  const c = state.campaigns.find((x) => x.id === arg && isActive(x)) ?? stalled ?? state.campaigns[0];
  const a = accountById(c.accountId);
  const cov = committeeCoverage(state, a.id);
  const routeObj = c.introducerBriefRouteId ? state.routes.find((r) => r.id === c.introducerBriefRouteId) : null;
  const tickets = state.tickets.filter((t) => t.campaignId === c.id);
  const update = (patch: Partial<Campaign>, note: string) => setState(withLog(replaceCampaign(state, { ...c, ...patch, lastTouch: state.today }), `${a.name}: ${note}`));
  const nextTarget: Stage | null = c.stage === 'stalled' ? c.resumeStage ?? 'map' : STAGES[STAGES.indexOf(c.stage) + 1] ?? null;
  const chk = nextTarget ? canAdvance(state, c, nextTarget) : null;
  const allTickets = state.tickets;

  return (
    <>
      <PageTitle title="Campaign momentum" lede="Every campaign has an owner, a dated next step and an SLA. Stalls show their reason and what fixes them. Actions produce preparation tickets, never emails or invites." />
      <CampaignPicker state={state} current={c.id} view="momentum" />
      <Section title={a.name} id="mom" kicker={<><ProvenanceChip synthetic={a.synthetic} /> <Pill tone={stageTone(c.stage)}>{stageLabel[c.stage]}</Pill> {SELLERS.find((s) => s.id === c.sellerId)!.label}</>}>
        <ol className="stepper" aria-label="Stage">
          {STAGES.map((s) => {
            const idx = STAGES.indexOf(s);
            const cur = STAGES.indexOf(c.stage === 'stalled' ? c.resumeStage ?? 'map' : c.stage);
            return <li key={s} className={idx < cur ? 'done' : idx === cur ? (c.stage === 'stalled' ? 'stalled' : 'current') : ''} aria-current={idx === cur ? 'step' : undefined}>{stageLabel[s]}</li>;
          })}
        </ol>
        {c.failureReason && <p className="failure" role="alert"><strong>Failure reason:</strong> {c.failureReason}</p>}
        <div className="form">
          <label>Owner
            <select value={c.ownerId ?? ''} onChange={(e) => update({ ownerId: e.target.value || null }, `owner set to ${personLabel(e.target.value) ?? 'none'}`)}>
              <option value="">Unassigned</option>
              {PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <label>Next action date<input type="date" value={c.nextActionDate ?? ''} min={state.today} onChange={(e) => update({ nextActionDate: e.target.value || null }, 'next action date set')} /></label>
          <label className="wide">Next action<input value={c.nextAction ?? ''} placeholder="e.g. Ask the dinner host whether the CISO is attending" onChange={(e) => update({ nextAction: e.target.value || null }, 'next action edited')} /></label>
          <label>SLA (days between touches)<input type="number" min={1} max={30} value={c.slaDays} onChange={(e) => update({ slaDays: Number(e.target.value) }, 'SLA changed')} /></label>
          <div className="quick">
            <span className="small muted">Quick dates</span>
            {[2, 5, 7].map((n) => <button key={n} type="button" className="btn btn-small btn-quiet" onClick={() => update({ nextActionDate: addDays(state.today, n) }, `next action date +${n}d`)}>+{n} days</button>)}
          </div>
        </div>
        <div className="advance">
          {nextTarget && (
            <button className="btn btn-lime" onClick={() => {
              if (!chk!.ok) { say(`Blocked: ${chk!.blockers[0]}`); return; }
              setState(advance(state, c.id, nextTarget)); say(`${a.name} moved to ${stageLabel[nextTarget]}.`);
            }}>{c.stage === 'stalled' ? `Resume at ${stageLabel[nextTarget]}` : `Advance to ${stageLabel[nextTarget]}`}</button>
          )}
          {c.stage !== 'stalled' && <button className="btn btn-quiet" onClick={() => { setState(advance(state, c.id, 'stalled')); say('Marked stalled.'); }}>Mark stalled</button>}
          {chk && !chk.ok && <ul className="blockers" aria-label="What blocks the next stage">{chk.blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
        </div>
      </Section>
      <div className="grid-3">
        <Section title="Stakeholder coverage" id="cov" kicker={`${cov.covered} of ${cov.total} seats mapped`}>
          <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={cov.total} aria-valuenow={cov.covered} aria-label="Committee coverage"><span style={{ width: `${(cov.covered / cov.total) * 100}%` }} /></div>
          {cov.unknown.length > 0 && <p className="small">Unknown: {cov.unknown.map((u) => u.title).join('; ')}</p>}
        </Section>
        <Section title="Event or roundtable" id="evt" kicker={c.eventPlan ?? 'None planned'}>
          <button className="btn btn-small" onClick={() => { const r = prepTicket(state, c, 'event-invite'); if (!r.ok) say(`Blocked: ${r.blockers[0]}`); else { setState(r.state); say('Event seat ticket prepared. No invite sent.'); } }}>Prepare event seat ticket</button>
        </Section>
        <Section title="Introducer brief" id="intro" kicker={routeObj ? `${routeObj.introducer} · ${basisLabel[routeObj.basis]}` : 'No route attached'}>
          <button className="btn btn-small" onClick={() => { const r = prepTicket(state, c, 'intro-request'); if (!r.ok) say(`Blocked: ${r.blockers[0]}`); else { setState(r.state); say('Intro-request ticket prepared. Nothing sent.'); } }}>Prepare intro-request ticket</button>
        </Section>
      </div>
      <Section title="Preparation tickets" id="tickets" kicker={`${allTickets.length} prepared on this desk · ${tickets.length} for ${a.name}. Copy into your own tools; the desk sends nothing.`}>
        {allTickets.length === 0 ? <p className="muted">None yet.</p> : (
          <ul className="list">{allTickets.map((t) => <li key={t.id}><Pill tone="info">{t.kind}</Pill> <span className="small muted">{fmtDate(t.createdOn)}</span> {t.body}</li>)}</ul>
        )}
      </Section>
      <Section title="Weekly capacity board" id="cap">
        <div className="capboard">
          {SELLERS.map((s) => {
            const l = sellerLoad(state, s.id);
            return (
              <div key={s.id}>
                <strong>{s.label}</strong> <span className="muted small">{l.active} of {l.capacity}</span>
                <ul>{state.campaigns.filter((x) => x.sellerId === s.id).map((x) => <li key={x.id}><a href={`#/momentum/${x.id}`}>{accountById(x.accountId).name}</a> <Pill tone={stageTone(x.stage)}>{stageLabel[x.stage]}</Pill></li>)}</ul>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

/* ------------------------------ Trust ------------------------------ */

function TrustView({ state }: P) {
  const [runAt, setRunAt] = useState(0);
  const results = useMemo(() => { void runAt; return runTrustTests(state); }, [state, runAt]);
  const m = metrics(state);
  const passed = results.filter((r) => r.pass).length;
  return (
    <>
      <PageTitle title="Trust and measurement" lede="The desk tries to break its own rules against the live state. Measures show numerator, denominator and window. CRM outcomes are not invented." />
      <Section title={`Trust tests: ${passed} of ${results.length} pass`} id="trust" actions={<button className="btn btn-small" onClick={() => setRunAt(Date.now())}>Run again</button>}>
        <ul className="trust">
          {results.map((r) => (
            <li key={r.id} className={r.pass ? 'pass' : 'fail'}>
              <Pill tone={r.pass ? 'ok' : 'risk'}>{r.pass ? 'Pass' : 'Fail'}</Pill>
              <div><strong>{r.name}</strong><p className="small">{r.detail}</p></div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Measures" id="metrics" kicker="Simulated operational measures from desk state. CRM-dependent outcomes are listed so the gap is visible.">
        <table className="metrics">
          <caption className="sr-only">Desk measures with denominators</caption>
          <thead><tr><th scope="col">Measure</th><th scope="col">Value</th><th scope="col">Window</th><th scope="col">Type</th></tr></thead>
          <tbody>
            {m.map((x) => (
              <tr key={x.id}>
                <th scope="row">{x.label}<br /><small className="muted">{x.note}</small></th>
                <td className="num">{x.num === null ? 'Not measured' : x.den === null ? x.num : <>{x.num} / {x.den}<br /><small>{x.den ? Math.round((x.num / x.den) * 100) : 0}%</small></>}</td>
                <td>{x.window}</td>
                <td><Pill tone={x.kind === 'simulated' ? 'info' : 'muted'}>{x.kind === 'simulated' ? 'Simulated' : 'Needs CRM'}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Desk log" id="log" kicker="Local only, newest first.">
        {state.log.length === 0 ? <p className="muted">No changes yet.</p> : <ul className="list">{state.log.slice(0, 12).map((l, i) => <li key={i}><span className="small muted">{fmtDate(l.at)}</span> {l.text}</li>)}</ul>}
      </Section>
    </>
  );
}

/* ------------------------------ Value ------------------------------ */

function ValueView() {
  return (
    <>
      <PageTitle title="Why this desk, and the first 30 days" lede="What it is in 30 seconds, what it is for, and how it would be adopted." />
      <div className="grid-2">
        <Section title="In 30 seconds" id="v30">
          <p>Three strategic sellers each carry two or three top-account campaigns. This desk is where the associate keeps those nine slots honest: who sits on each buying committee, which warm routes are real, which signals are fresh enough to act on, and one five-sentence brief per account. It refuses to treat a shared investor as an introduction, a stale headline as a reason, or an ownerless campaign as moving.</p>
        </Section>
        <Section title="What it is not" id="vnot">
          <ul className="list">
            <li>Not a CRM: no pipeline, no forecast, no invented revenue.</li>
            <li>Not a lead scraper: one real account, from the company's own public pages.</li>
            <li>Not a sequencer: no email, no cadence, no calendar. Preparation tickets only.</li>
          </ul>
        </Section>
      </div>
      <Section title="First 30 days" id="v30d">
        <ol className="days">
          <li><strong>Days 1–5:</strong> sit with each seller, list their real top accounts, and confirm the capacity rule (three active each) with the sales leader.</li>
          <li><strong>Days 6–10:</strong> map buying committees from public sources; mark every unknown seat as unknown.</li>
          <li><strong>Days 11–15:</strong> build the route ledger with investors, advisors, partners and customers. Verify nothing without the introducer's own word.</li>
          <li><strong>Days 16–22:</strong> set signal shelf lives with marketing and events; tie each live event to a named campaign.</li>
          <li><strong>Days 23–30:</strong> run the Monday review from the desk; report the measures with denominators; agree which CRM fields would close the outcome gap.</li>
        </ol>
      </Section>
      <Section title="About this concept" id="vabout">
        <p>Independent concept by Ayo Ahmed for the Strategic GTM Associate role. Not affiliated with or endorsed by Harmonic Security. Harmonic name and logo belong to Harmonic Security and are used only to show how the desk would sit beside its product. Product names referenced: Harmonic Explore, Guide and Command, as described on harmonic.security.</p>
      </Section>
    </>
  );
}
