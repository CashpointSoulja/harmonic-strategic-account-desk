# PRD: Strategic Account Desk

Independent concept by Ayo Ahmed for Harmonic Security's Strategic GTM Associate role. Not affiliated with or endorsed by Harmonic Security. Everything below the research ledger is a hypothesis until someone doing the job confirms it.

## Problem (hypothesis)

The posting describes an associate who supports strategic sellers on Fortune 100/250 accounts through warm routes (investors, advisors, partners, customers, team networks), executive events, account mapping, signal tracking and briefing, and explicitly not through cold sequences or call targets. The work that matters is small in count (about nine live campaigns across three sellers) but high in judgement. The likely failure modes are:

1. A shared investor or board seat is treated as an introduction.
2. A stale headline is used as the reason to reach out.
3. A campaign loses its owner after an event and quietly stalls.
4. A seller gets a fourth campaign and all four slow down.
5. A brief overclaims a relationship or hides that the trigger is old.
6. Metrics report activity with no denominator, or invent pipeline.

## Users

The Strategic GTM Associate (primary), three strategic sellers, the marketing/events lead and the sales leader. See [PERSONAS.md](PERSONAS.md).

## Goals

- One screen that shows the week: nine slots, who owns what, what is due, what is stuck.
- A route ledger that can say "no" to a fake warm intro and explain why.
- A five-sentence brief that is exactly five sentences and states its uncertainty.
- Measures with numerators, denominators and windows; CRM outcomes left visibly unmeasured.

## Non-goals

Sending email, booking calendars, writing to a CRM, scraping leads, scoring individuals, forecasting revenue.

## Scope (v1, built)

| Area | Requirement | Where |
| --- | --- | --- |
| Weekly desk | 3 seller lanes, cap 3 each (9 slots), priority with separate fit/timing/route scores, explicit weights, unknown shown as Unknown, owner/next/date, overdue, missing-next-step, SLA flags, parked campaigns with capacity reason | `#/desk` |
| Account map | Buying committee (CISO, AI/platform, data governance, procurement/legal, exec sponsor), decides vs influences, coverage, unknowns, evidence ledger with sentence/source/date/confidence/provenance; one real public-evidence account (JPMorganChase) labelled as a prospect hypothesis | `#/account/:id` |
| Warm routes | Verified relationship / public affiliation only / hypothesis / synthetic demo; intro blocked until relationship, introducer permission and recipient are verified; 30-day ask cooldown; prepare-only tickets | `#/routes` |
| Signals | Leadership, AI initiative, regulatory, event, news; source date, relevance, shelf life, expiry; stale and unsupported rejection; dedupe; why-now and follow-on; public vs synthetic styling; add-signal form | `#/signals` |
| Brief | Exactly five editable sentences; ready gate with listed evidence gaps; overclaim detector; copy and download; share mode | `#/brief/:campaign` |
| Momentum | Stage state machine, failure reasons, owner/next/date/SLA editing, stall fix, event and introducer tickets, local reminders, capacity board | `#/momentum/:campaign` |
| Trust & metrics | Eight live trust tests; nine measures with denominators and windows; CRM-dependent outcomes marked Not measured | `#/trust` |
| Value | 30-second explanation, what it is not, first 30 days | `#/value` |
| Data | Browser-local state, reset demo, share-mode export | header |

## Constraints

Zero login. No backend. No paid services. Static hosting with relative asset paths. Synthetic data labelled on every screen and in every export.

## Success criteria for the concept

Not business outcomes (none are claimed). The concept succeeds if a strategic seller can, in under two minutes, see their three campaigns, understand why each is ranked where it is, and see the desk refuse the six failure modes above. Acceptance tests are in [ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md).
