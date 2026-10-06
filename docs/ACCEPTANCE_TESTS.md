# Acceptance tests

Each maps to an automated check. U = unit (`test/domain.test.ts`), E = end-to-end (`e2e/desk.spec.ts`, desktop 1366×900 and mobile 390×844).

| # | Given / when / then | Check |
| --- | --- | --- |
| A1 | Seeded desk: 3 lanes, each 2–3 active, 9 slots, "8 of 9" shown | U weekly desk; E weekly desk |
| A2 | Account with <50 evidenced fit points shows Fit Unknown, not 0 | U unknown fit; E Kestrel shows Unknown |
| A3 | Parked Larchmont cannot reactivate under Seller A (3/3); can after moving to Seller C | U capacity; E capacity overflow |
| A4 | Public-affiliation route with all boxes ticked is still blocked | U routes; Trust test "Fake warm relationship" |
| A5 | Verified synthetic Brightwater route prepares a ticket that says "not sent" | U prep ticket; E routes |
| A6 | Introducer asked 16 days ago is blocked by the 30-day cooldown | U cooldown |
| A7 | 2025 supplier letter is Stale; unsourced rumour is Unsupported | U signals; E signals |
| A8 | Shelf-life boundary: day 30 usable, day 31 stale | U boundary |
| A9 | Re-adding an existing signal (same source and headline) is refused | U dedupe; E signals |
| A10 | Instruction-shaped headline is stored as text and rejected as unsupported | E signals; Trust test |
| A11 | Every composed brief is exactly five one-sentence fields | U compose |
| A12 | 4 or 6 sentences, or an unterminated last sentence, fail validation | U brief; E brief |
| A13 | Overclaim ("knows the CISO") on an unverified route blocks ready | U brief; E brief |
| A14 | Stalled Meridian cannot resume without owner and dated next step; resumes after | U state machine; E stalled |
| A15 | Share-mode exports contain provenance and no internal notes or uncertain names | U export; E exports |
| A16 | State persists across reload; Reset demo restores seed; corrupt storage falls back | U local state; E stalled |
| A17 | No horizontal overflow and no serious/critical axe violations on all 8 views at both widths | E per-view |
| A18 | Skip link and rail are keyboard operable | E keyboard |
| A19 | Measures show 6 / 8 owned; meetings and pipeline Not measured | U metrics; E trust |
| A20 | Unknown parts add nothing and are not rescaled; coverage and Unknown count show beside every priority; removing evidence never raises priority (Kestrel 28, coverage 28%) | U incomplete evidence; E coverage; Trust test "Incomplete evidence never ranks higher" |
