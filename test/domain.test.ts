import { describe, expect, it } from 'vitest';
import { initialState, ACCOUNTS, SELLERS } from '../src/domain/fixtures';
import {
  advance, briefReadiness, canAdvance, composeBrief, dedupeSignals, exportBrief, exportDesk, fitScore, judgeSignal, metrics,
  prepTicket, priority, replaceCampaign, routeGate, sellerLoad, splitSentences, timingScore, validateBriefText,
} from '../src/domain/logic';
import { runTrustTests } from '../src/domain/trust';
import { load, reset, save, STORAGE_KEY } from '../src/domain/store';

const s = initialState();
const camp = (id: string, st = s) => st.campaigns.find((c) => c.id === id)!;

describe('weekly desk', () => {
  it('has three sellers with two or three active campaigns each, nine slots total', () => {
    expect(SELLERS).toHaveLength(3);
    expect(SELLERS.reduce((n, x) => n + x.capacity, 0)).toBe(9);
    for (const x of SELLERS) {
      const { active } = sellerLoad(s, x.id);
      expect(active).toBeGreaterThanOrEqual(2);
      expect(active).toBeLessThanOrEqual(3);
    }
  });
  it('keeps unknown fit as unknown, not zero', () => {
    const vant = ACCOUNTS.find((a) => a.id === 'vant')!;
    expect(fitScore(vant).value).toBeNull();
    expect(timingScore(s, 'larch').value).toBeNull();
  });
  it('shows fit, timing and route separately with weights', () => {
    const p = priority(s, camp('c-bright'));
    expect(p.parts.fit.value).toBe(100);
    expect(p.parts.route.value).toBe(100);
    expect(p.value).not.toBeNull();
  });
});

describe('signals', () => {
  it('rejects the 2025 supplier letter as stale and the rumour as unsupported', () => {
    expect(judgeSignal(s.signals.find((x) => x.id === 'sg-jpmc-supplier')!, s.today).status).toBe('stale');
    expect(judgeSignal(s.signals.find((x) => x.id === 'sg-vant-rumour')!, s.today).status).toBe('unsupported');
    expect(judgeSignal(s.signals.find((x) => x.id === 'sg-jpmc-letter')!, s.today).status).toBe('usable');
  });
  it('expires on the boundary day + 1', () => {
    const sig = { ...s.signals[0], sourceDate: '2026-09-06', shelfLifeDays: 30 };
    expect(judgeSignal(sig, '2026-10-06').status).toBe('usable');
    expect(judgeSignal(sig, '2026-10-07').status).toBe('stale');
  });
  it('dedupes by account + source + normalised headline', () => {
    const r = dedupeSignals([...s.signals, { ...s.signals[3], id: 'x', headline: s.signals[3].headline.toUpperCase() }]);
    expect(r.dropped).toHaveLength(1);
  });
});

describe('routes', () => {
  it('blocks public affiliation and hypothesis routes even when boxes are ticked', () => {
    const r = { ...s.routes[0], relationshipVerified: true, introducerPermission: true, recipientConfirmed: true };
    expect(routeGate(r, s.today).ready).toBe(false);
    expect(routeGate(s.routes.find((x) => x.id === 'r-jpmc-peer')!, s.today).ready).toBe(false);
  });
  it('clears the verified synthetic route and enforces the 30-day cooldown', () => {
    expect(routeGate(s.routes.find((x) => x.id === 'r-bright')!, s.today).ready).toBe(true);
    const ostr = routeGate(s.routes.find((x) => x.id === 'r-ostr')!, s.today);
    expect(ostr.ready).toBe(false);
    expect(ostr.blockers.join(' ')).toMatch(/16 days ago/);
  });
});

describe('brief', () => {
  it('counts sentences, ignoring abbreviations', () => {
    expect(splitSentences('The U.S. bank grew. It said so.')).toHaveLength(2);
    expect(validateBriefText('A. B. C. D.').ok).toBe(false);
    expect(validateBriefText('A. B. C. D. E. F.').ok).toBe(false);
    expect(validateBriefText('A one. B two. C three. D four. E five.').ok).toBe(true);
    expect(validateBriefText('A one. B two. C three. D four. E five').ok).toBe(false);
  });
  it('composes exactly five sentences for every campaign', () => {
    for (const c of s.campaigns) {
      const b = composeBrief(s, c);
      expect(b).toHaveLength(5);
      b.forEach((x) => expect(splitSentences(x)).toHaveLength(1));
    }
  });
  it('JPMorganChase brief cites a fresh public source, never the stale 2025 letter', () => {
    const b = composeBrief(s, camp('c-jpmc'));
    expect(b[1]).toMatch(/jpmorganchase.com/);
    expect(b[1]).not.toContain('open-letter-to-our-suppliers');
    expect(b[3]).toMatch(/no introduction is requested/);
  });
  it('blocks ready when the trigger is stale or a relationship is overclaimed', () => {
    expect(briefReadiness(s, camp('c-kest')).ready).toBe(false);
    expect(briefReadiness(s, camp('c-kest')).gaps.join(' ')).toMatch(/stale/);
    const c = camp('c-jpmc');
    const sentences = composeBrief(s, c);
    sentences[3] = 'Best route: a board member knows the CISO well.';
    const st = { ...s, briefs: { [c.id]: { campaignId: c.id, sentences, edited: true } } };
    expect(briefReadiness(st, c).gaps.join(' ')).toMatch(/not verified/);
  });
});

describe('campaign state machine', () => {
  it('cannot resume a stalled campaign without owner and dated step', () => {
    const c = camp('c-mer');
    expect(canAdvance(s, c, 'route').ok).toBe(false);
    const fixed = replaceCampaign(s, { ...c, ownerId: 'sb', nextAction: 'Ask the dinner host', nextActionDate: '2026-10-09' });
    const after = advance(fixed, 'c-mer', 'route');
    expect(camp('c-mer', after).stage).toBe('route');
    expect(camp('c-mer', after).failureReason).toBeNull();
  });
  it('blocks capacity overflow for a parked campaign', () => {
    expect(canAdvance(s, camp('c-larch'), 'map').blockers.join(' ')).toMatch(/Capacity overflow/);
    const moved = replaceCampaign(s, { ...camp('c-larch'), sellerId: 'sc' });
    expect(canAdvance(moved, camp('c-larch', moved), 'map').ok).toBe(true);
  });
  it('prepares, never sends, an intro ticket for the verified route', () => {
    const r = prepTicket(s, camp('c-bright'), 'intro-request');
    expect(r.ok).toBe(true);
    expect(r.state.tickets[0].body).toMatch(/not sent/);
    expect(prepTicket(s, camp('c-jpmc'), 'intro-request').ok).toBe(false);
  });
});

describe('trust, metrics and export', () => {
  it('passes every trust test on the seeded desk', () => {
    const t = runTrustTests(s);
    expect(t).toHaveLength(9);
    t.forEach((x) => expect(x.pass, x.name).toBe(true));
  });
  it('reports denominators and refuses CRM outcomes', () => {
    const m = metrics(s);
    expect(m.find((x) => x.id === 'owned')).toMatchObject({ num: 6, den: 8 });
    expect(m.filter((x) => x.kind === 'crm-dependent').every((x) => x.num === null)).toBe(true);
  });
  it('share mode strips internal notes and uncertain names', () => {
    const share = exportDesk(s, 'share');
    const internal = exportDesk(s, 'internal');
    expect(internal).toContain('Patrick Opet');
    expect(share).not.toContain('Patrick Opet');
    s.routes.forEach((r) => expect(share).not.toContain(r.internalNote));
    expect(share).toContain('[SYNTHETIC]');
    expect(share).toContain('https://www.jpmorganchase.com/ir/annual-report/2025/ar-ceo-letters');
    expect(exportBrief(s, camp('c-jpmc'), 'share')).not.toContain('Patrick Opet');
  });
});

describe('local state', () => {
  it('saves, loads and resets', () => {
    const mem = new Map<string, string>();
    const st = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
    const changed = replaceCampaign(s, { ...camp('c-mer'), ownerId: 'sb' });
    save(changed, st);
    expect(load(st).campaigns.find((c) => c.id === 'c-mer')!.ownerId).toBe('sb');
    reset(st);
    expect(mem.has(STORAGE_KEY)).toBe(false);
    expect(load(st).campaigns.find((c) => c.id === 'c-mer')!.ownerId).toBeNull();
    mem.set(STORAGE_KEY, '{bad json');
    expect(load(st).campaigns).toHaveLength(9);
  });
});

describe('incomplete evidence', () => {
  it('unknown parts add nothing and never outrank evidenced campaigns', () => {
        const k = priority(s, camp('c-kest'));
    expect(k.parts.timing.value).toBeNull();
    expect(k.parts.route.value).toBeNull();
    expect(k.value).toBe(28);
    expect(k.coverage).toBe(0.28);
    expect(k.unknown).toEqual(['timing', 'route']);
    for (const id of ['c-bright', 'c-jpmc']) expect(priority(s, camp(id)).value!).toBeGreaterThan(k.value!);
  });
  it('removing evidence cannot raise priority or coverage', () => {
        for (const c of s.campaigns) {
      const full = priority(s, c);
      const less = priority({ ...s, signals: s.signals.filter((x) => x.accountId !== c.accountId), routes: s.routes.filter((x) => x.accountId !== c.accountId) }, c);
      expect(less.value ?? 0).toBeLessThanOrEqual(full.value ?? 0);
      expect(less.coverage).toBeLessThanOrEqual(full.coverage);
    }
  });
  it('fit counts unknown factors as unearned and reports coverage', () => {
    const f = fitScore(ACCOUNTS.find((a) => a.id === 'jpmc')!);
    expect(f.value).toBe(85);
    expect(f.coverage).toBe(0.85);
  });
});
