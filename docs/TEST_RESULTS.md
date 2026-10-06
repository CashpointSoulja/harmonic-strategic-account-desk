# Test results

Run on 2026-10-06 on a Linux build machine, Node 22, Chromium (Playwright 1.47). Output below is copied from the terminal; build timing lines are as printed. Re-run with the commands in [TEST_PLAN.md](TEST_PLAN.md).

## Summary

| Check | Result |
| --- | --- |
| Typecheck (`tsc -b --noEmit`, strict) | Pass, 0 errors |
| Lint (ESLint) | Pass, 0 problems |
| Build (Vite) | Pass |
| Unit (Vitest) | 19 / 19 pass |
| End-to-end (Playwright, desktop 1366×900 + mobile 390×844) | 34 / 34 pass (17 tests × 2 viewports) |
| Horizontal overflow, 8 views × 2 widths | 0 px on all 16 |
| Axe WCAG 2 A/AA, serious or critical | 0 on all 16 |
| Visual inspection | All 16 screenshots in `docs/screens/` reviewed by eye |

## Defects found and fixed during testing

| Defect | Fix |
| --- | --- |
| Information icon rendered as a missing-glyph box (Poppins has no ⓘ) | Replaced with an inline SVG icon |
| Hash navigation focused `<main>` and scrolled the page title under the sticky header | Focus with `preventScroll` and scroll to top on view change |
| Technology page signal read as if published on the access date | Source title now says the page is undated and when it was read |
| Mobile header and strip used about 440 px before content | Compact mobile strip text, single-row actions; content now starts about 360 px down |
| Mobile action row overflowed by 23 px after the first compaction | Desk date moved to its own line |
| Font URLs were root-absolute (break on a Pages sub-path) | Fonts moved into the bundle with relative URLs |
| Two unit expectations were wrong (expected stale source; expected 7/8 owned) | Corrected to the rule's real output (fresher source chosen; 6/8) |
| Five E2E selectors matched the export preview as well as the gap list | Scoped selectors to the gap list |

## Raw output

```text
$ npm run typecheck
exit 0
$ npm run lint
exit 0
$ npm run build
computing gzip size...
dist/index.html                                        0.73 kB │ gzip:  0.40 kB
dist/assets/poppins-latin-500-normal-C8OXljZJ.woff2    7.75 kB
dist/assets/poppins-latin-700-normal-Qrb0O0WB.woff2    7.82 kB
dist/assets/poppins-latin-400-normal-cpxAROuN.woff2    7.88 kB
dist/assets/poppins-latin-600-normal-zEkxB9Mr.woff2    8.00 kB
dist/assets/index-CtOpR2Vm.css                        14.33 kB │ gzip:  3.77 kB
dist/assets/index-B5Kvp_uR.js                        214.64 kB │ gzip: 68.40 kB
✓ built in 5.50s
$ npm test
 ✓ test/domain.test.ts > weekly desk > has three sellers with two or three active campaigns each, nine slots total 2ms
 ✓ test/domain.test.ts > weekly desk > keeps unknown fit as unknown, not zero 0ms
 ✓ test/domain.test.ts > weekly desk > shows fit, timing and route separately with weights 11ms
 ✓ test/domain.test.ts > signals > rejects the 2025 supplier letter as stale and the rumour as unsupported 0ms
 ✓ test/domain.test.ts > signals > expires on the boundary day + 1 0ms
 ✓ test/domain.test.ts > signals > dedupes by account + source + normalised headline 0ms
 ✓ test/domain.test.ts > routes > blocks public affiliation and hypothesis routes even when boxes are ticked 0ms
 ✓ test/domain.test.ts > routes > clears the verified synthetic route and enforces the 30-day cooldown 0ms
 ✓ test/domain.test.ts > brief > counts sentences, ignoring abbreviations 1ms
 ✓ test/domain.test.ts > brief > composes exactly five sentences for every campaign 6ms
 ✓ test/domain.test.ts > brief > JPMorganChase brief cites a fresh public source, never the stale 2025 letter 1ms
 ✓ test/domain.test.ts > brief > blocks ready when the trigger is stale or a relationship is overclaimed 1ms
 ✓ test/domain.test.ts > campaign state machine > cannot resume a stalled campaign without owner and dated step 0ms
 ✓ test/domain.test.ts > campaign state machine > blocks capacity overflow for a parked campaign 0ms
 ✓ test/domain.test.ts > campaign state machine > prepares, never sends, an intro ticket for the verified route 1ms
 ✓ test/domain.test.ts > trust, metrics and export > passes every trust test on the seeded desk 11ms
 ✓ test/domain.test.ts > trust, metrics and export > reports denominators and refuses CRM outcomes 3ms
 ✓ test/domain.test.ts > trust, metrics and export > share mode strips internal notes and uncertain names 3ms
 ✓ test/domain.test.ts > local state > saves, loads and resets 1ms
 Test Files  1 passed (1)
      Tests  19 passed (19)
$ npm run e2e
  ✓  2 [desktop] › desk.spec.ts:13:3 › desk: renders, no horizontal overflow, no serious axe violations
  ✓  1 [mobile] › desk.spec.ts:13:3 › desk: renders, no horizontal overflow, no serious axe violations
  ✓  4 [mobile] › desk.spec.ts:13:3 › account/jpmc: renders, no horizontal overflow, no serious axe violations
  ✓  3 [desktop] › desk.spec.ts:13:3 › account/jpmc: renders, no horizontal overflow, no serious axe violations
  ✓  6 [desktop] › desk.spec.ts:13:3 › routes: renders, no horizontal overflow, no serious axe violations
  ✓  5 [mobile] › desk.spec.ts:13:3 › routes: renders, no horizontal overflow, no serious axe violations
  ✓  7 [desktop] › desk.spec.ts:13:3 › signals: renders, no horizontal overflow, no serious axe violations
  ✓  8 [mobile] › desk.spec.ts:13:3 › signals: renders, no horizontal overflow, no serious axe violations
  ✓  9 [desktop] › desk.spec.ts:13:3 › brief/c-jpmc: renders, no horizontal overflow, no serious axe violations
  ✓  10 [mobile] › desk.spec.ts:13:3 › brief/c-jpmc: renders, no horizontal overflow, no serious axe violations
  ✓  11 [desktop] › desk.spec.ts:13:3 › momentum/c-mer: renders, no horizontal overflow, no serious axe violations
  ✓  12 [mobile] › desk.spec.ts:13:3 › momentum/c-mer: renders, no horizontal overflow, no serious axe violations
  ✓  13 [desktop] › desk.spec.ts:13:3 › trust: renders, no horizontal overflow, no serious axe violations
  ✓  14 [mobile] › desk.spec.ts:13:3 › trust: renders, no horizontal overflow, no serious axe violations
  ✓  15 [desktop] › desk.spec.ts:13:3 › value: renders, no horizontal overflow, no serious axe violations
  ✓  16 [mobile] › desk.spec.ts:13:3 › value: renders, no horizontal overflow, no serious axe violations
  ✓  17 [desktop] › desk.spec.ts:26:1 › weekly desk shows three lanes and 8 of 9 slots
  ✓  18 [mobile] › desk.spec.ts:26:1 › weekly desk shows three lanes and 8 of 9 slots
  ✓  19 [desktop] › desk.spec.ts:33:1 › capacity overflow blocks reactivation until the campaign moves lanes
  ✓  20 [mobile] › desk.spec.ts:33:1 › capacity overflow blocks reactivation until the campaign moves lanes
  ✓  21 [desktop] › desk.spec.ts:43:1 › public-affiliation route is blocked; verified synthetic route prepares a ticket
  ✓  22 [mobile] › desk.spec.ts:43:1 › public-affiliation route is blocked; verified synthetic route prepares a ticket
  ✓  23 [desktop] › desk.spec.ts:55:1 › signals: stale is rejected, duplicates refused, input is data
  ✓  24 [mobile] › desk.spec.ts:55:1 › signals: stale is rejected, duplicates refused, input is data
  ✓  25 [desktop] › desk.spec.ts:67:1 › brief: five-sentence boundary and relationship overclaim block readiness
  ✓  26 [mobile] › desk.spec.ts:67:1 › brief: five-sentence boundary and relationship overclaim block readiness
  ✓  27 [desktop] › desk.spec.ts:79:1 › brief and desk exports keep provenance and strip internal fields in share mode
  ✓  28 [mobile] › desk.spec.ts:79:1 › brief and desk exports keep provenance and strip internal fields in share mode
  ✓  29 [desktop] › desk.spec.ts:96:1 › stalled campaign is fixed by assigning owner and dated next step, and state persists then resets
  ✓  30 [mobile] › desk.spec.ts:96:1 › stalled campaign is fixed by assigning owner and dated next step, and state persists then resets
  ✓  31 [desktop] › desk.spec.ts:113:1 › keyboard: skip link and rail navigation work without a mouse
  ✓  32 [mobile] › desk.spec.ts:113:1 › keyboard: skip link and rail navigation work without a mouse
  ✓  33 [desktop] › desk.spec.ts:126:1 › trust page reports numerators, denominators and CRM gaps
  ✓  34 [mobile] › desk.spec.ts:126:1 › trust page reports numerators, denominators and CRM gaps
  34 passed
```

## Not yet run

- Live deployed URL checks (signed-out, direct refresh, mobile): pending deployment.
- Assistive-technology testing with a real screen reader.
- Browsers other than Chromium.
