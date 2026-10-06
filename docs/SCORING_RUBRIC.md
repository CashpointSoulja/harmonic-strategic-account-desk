# Scoring rubric

Code: `fitScore`, `timingScore`, `routeScore`, `priority` in `src/domain/logic.ts`. Weights are fixed and shown on the weekly desk.

## Fit (0–100 or Unknown)

| Factor | Weight |
| --- | --- |
| Regulated industry | 30 |
| Published AI adoption | 30 |
| Enterprise scale | 25 |
| Sensitive data handled | 15 |

Fit = points earned ÷ points known × 100. Unknown factors are excluded. If fewer than 50 points are known, Fit is **Unknown**.

## Timing (0–100 or Unknown)

Best usable signal for the account: relevance × 20 × (0.5 + 0.5 × freshness), freshness = 1 − age ÷ shelf life. No usable signal → **Unknown**. Stale, unsupported and future-dated signals score nothing.

## Route readiness (0–100 or Unknown)

Basis: verified relationship 40, public affiliation 15, hypothesis 5. +20 each for relationship verified, introducer permission, recipient confirmed. −30 if the introducer was asked in the last 30 days. Clamped 0–100. No route → **Unknown**.

## Priority

Priority = (0.40 × fit + 0.35 × timing + 0.25 × route) ÷ (sum of weights of the known parts). If all three are unknown, Priority is Unknown. Priority orders work; it is not a forecast.

## Worked examples (desk date 2026-10-06)

**Brightwater Financial (synthetic).** Fit: 100 of 100 known → 100. Timing: "New CISO appointed" dated 2026-09-22, relevance 4, shelf life 120, age 14, freshness 0.883 → 4 × 20 × 0.942 = 75. Route: verified 40 + 20 + 20 + 20 = 100. Priority = (40 + 26.25 + 25) ÷ 1.0 = 91.

**Kestrel Aerospace (synthetic).** Fit: published AI adoption unknown → 70 of 70 known → 100. Timing: only signal dated 2026-02-14 with 60-day shelf life → stale → Unknown. Route: none → Unknown. Priority = 40 ÷ 0.4 = 100, flagged "No usable trigger" and "No next step". This is deliberate: a strong-fit account with no trigger and no route ranks high as *work to do*, and the flags say what work.

**JPMorganChase (real, prospect hypothesis).** Fit: sensitive data unknown → 85 of 85 known → 100. Timing: the desk picks the usable signal with the highest relevance × freshness. The Technology page's Cybersecurity Month content (relevance 3, read on the desk date, freshness 100%) wins → 3 × 20 × 1.0 = 60. The 2025 CISO supplier letter is stale and scores nothing. Route: public affiliation only, no checks → 15. Priority = (0.40 × 100 + 0.35 × 60 + 0.25 × 15) ÷ 1.0 = 64.75 → 65, as shown on the desk.
