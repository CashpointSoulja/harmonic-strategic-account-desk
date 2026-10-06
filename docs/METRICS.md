# Metrics

All measures are computed from desk state on the desk date (2026-10-06 in the demo). They are **simulated operational measures**; none is a business outcome.

| Measure | Numerator | Denominator | Window | Seed value |
| --- | --- | --- | --- | --- |
| Campaigns with owner and dated next step | active campaigns with owner, next action and date | active (non-parked) campaigns | as of desk date | 6 / 8 |
| Touched within SLA | active campaigns with lastTouch ≤ SLA days ago | active campaigns | as of desk date | 5 / 8 |
| Committee seats mapped | seats with coverage ≠ unknown | 5 seats × active accounts | as of desk date | 24 / 40 |
| Signals usable as trigger | usable signals | all signals | sources dated before desk date | 8 / 11 |
| Routes cleared to ask | routes passing the gate | routes on the desk | as of desk date | 1 / 8 |
| Ready briefs | active campaigns with ready brief | active campaigns | as of desk date | 5 / 8 |
| Preparation tickets | tickets created | none (count) | 2026-09-08 to 2026-10-06 | 0 |
| Executive meetings sourced | — | — | — | Not measured (needs CRM) |
| Pipeline influenced | — | — | — | Not measured (needs CRM) |

Rules: unknown is never counted as success; stale and unsupported items stay in denominators; no percentage is shown without its fraction.
