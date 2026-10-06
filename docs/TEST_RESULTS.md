# Test results

Run on 2026-10-06 on a Linux build machine, Node 22, Chromium (Playwright 1.47). Output below is copied from the terminal; build timing lines are as printed. Re-run with the commands in [TEST_PLAN.md](TEST_PLAN.md).

## Summary

| Check | Result |
| --- | --- |
| Typecheck (`tsc -b --noEmit`, strict) | Pass, 0 errors |
| Lint (ESLint) | Pass, 0 problems |
| Build (Vite) | Pass |
| Unit (Vitest) | 22 / 22 pass |
| End-to-end (Playwright, desktop 1366×900 + mobile 390×844) | 36 / 36 pass (18 tests × 2 viewports) |
| Horizontal overflow, 8 views × 2 widths | 0 px on all 16 |
| Axe WCAG 2 A/AA, serious or critical | 0 on all 16 |
| Visual inspection | All 16 screenshots in `docs/screens/` reviewed by eye |

## Defects found and fixed during testing

| Defect | Fix |
| --- | --- |
| Priority averaged over known parts only, so Kestrel (fit only, timing and route Unknown) showed 100 and outranked evidenced campaigns (found in review) | Unknown parts now add nothing and known weights are not rescaled; fit counts unknown factors as unearned; evidence coverage and the Unknown count show beside every priority and in exports; Kestrel now shows 28 at 28% coverage; new unit tests, an E2E test and a ninth trust test ("Incomplete evidence never ranks higher") |
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
dist/index.html                                        0.73 kB │ gzip:  0.40 kB
dist/assets/poppins-latin-500-normal-C8OXljZJ.woff2    7.75 kB
dist/assets/poppins-latin-700-normal-Qrb0O0WB.woff2    7.82 kB
dist/assets/poppins-latin-400-normal-cpxAROuN.woff2    7.88 kB
dist/assets/poppins-latin-600-normal-zEkxB9Mr.woff2    8.00 kB
dist/assets/index-VezNucIH.css                        14.62 kB │ gzip:  3.83 kB
dist/assets/index-Cy0c0H4c.js                        216.05 kB │ gzip: 68.81 kB
✓ built in 5.33s
$ npm test
 ✓ test/domain.test.ts > weekly desk > has three sellers with two or three active campaigns each, nine slots total
 ✓ test/domain.test.ts > weekly desk > keeps unknown fit as unknown, not zero
 ✓ test/domain.test.ts > weekly desk > shows fit, timing and route separately with weights
 ✓ test/domain.test.ts > signals > rejects the 2025 supplier letter as stale and the rumour as unsupported
 ✓ test/domain.test.ts > signals > expires on the boundary day + 1
 ✓ test/domain.test.ts > signals > dedupes by account + source + normalised headline
 ✓ test/domain.test.ts > routes > blocks public affiliation and hypothesis routes even when boxes are ticked
 ✓ test/domain.test.ts > routes > clears the verified synthetic route and enforces the 30-day cooldown
 ✓ test/domain.test.ts > brief > counts sentences, ignoring abbreviations
 ✓ test/domain.test.ts > brief > composes exactly five sentences for every campaign
 ✓ test/domain.test.ts > brief > JPMorganChase brief cites a fresh public source, never the stale 2025 letter
 ✓ test/domain.test.ts > brief > blocks ready when the trigger is stale or a relationship is overclaimed
 ✓ test/domain.test.ts > campaign state machine > cannot resume a stalled campaign without owner and dated step
 ✓ test/domain.test.ts > campaign state machine > blocks capacity overflow for a parked campaign
 ✓ test/domain.test.ts > campaign state machine > prepares, never sends, an intro ticket for the verified route
 ✓ test/domain.test.ts > trust, metrics and export > passes every trust test on the seeded desk
 ✓ test/domain.test.ts > trust, metrics and export > reports denominators and refuses CRM outcomes
 ✓ test/domain.test.ts > trust, metrics and export > share mode strips internal notes and uncertain names
 ✓ test/domain.test.ts > local state > saves, loads and resets
 ✓ test/domain.test.ts > incomplete evidence > unknown parts add nothing and never outrank evidenced campaigns
 ✓ test/domain.test.ts > incomplete evidence > removing evidence cannot raise priority or coverage
 ✓ test/domain.test.ts > incomplete evidence > fit counts unknown factors as unearned and reports coverage
 Test Files  1 passed (1)
      Tests  22 passed (22)
$ npm run e2e
  ✓  1 [mobile] › desk.spec.ts:13:3 › desk: renders, no horizontal overflow, no serious axe violations
  ✓  2 [desktop] › desk.spec.ts:13:3 › desk: renders, no horizontal overflow, no serious axe violations
  ✓  3 [mobile] › desk.spec.ts:13:3 › account/jpmc: renders, no horizontal overflow, no serious axe violations
  ✓  4 [desktop] › desk.spec.ts:13:3 › account/jpmc: renders, no horizontal overflow, no serious axe violations
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
  ✓  16 [mobile] › desk.spec.ts:13:3 › value: renders, no horizontal overflow, no serious axe violations
  ✓  15 [desktop] › desk.spec.ts:13:3 › value: renders, no horizontal overflow, no serious axe violations
  ✓  17 [mobile] › desk.spec.ts:26:1 › weekly desk shows three lanes and 8 of 9 slots
  ✓  18 [desktop] › desk.spec.ts:26:1 › weekly desk shows three lanes and 8 of 9 slots
  ✓  19 [mobile] › desk.spec.ts:33:1 › capacity overflow blocks reactivation until the campaign moves lanes
  ✓  20 [desktop] › desk.spec.ts:33:1 › capacity overflow blocks reactivation until the campaign moves lanes
  ✓  22 [desktop] › desk.spec.ts:43:1 › public-affiliation route is blocked; verified synthetic route prepares a ticket
  ✓  21 [mobile] › desk.spec.ts:43:1 › public-affiliation route is blocked; verified synthetic route prepares a ticket
  ✓  24 [mobile] › desk.spec.ts:55:1 › signals: stale is rejected, duplicates refused, input is data
  ✓  23 [desktop] › desk.spec.ts:55:1 › signals: stale is rejected, duplicates refused, input is data
  ✓  26 [desktop] › desk.spec.ts:67:1 › brief: five-sentence boundary and relationship overclaim block readiness
  ✓  25 [mobile] › desk.spec.ts:67:1 › brief: five-sentence boundary and relationship overclaim block readiness
  ✓  27 [desktop] › desk.spec.ts:79:1 › brief and desk exports keep provenance and strip internal fields in share mode
  ✓  28 [mobile] › desk.spec.ts:79:1 › brief and desk exports keep provenance and strip internal fields in share mode
  ✓  30 [mobile] › desk.spec.ts:96:1 › stalled campaign is fixed by assigning owner and dated next step, and state persists then resets
  ✓  29 [desktop] › desk.spec.ts:96:1 › stalled campaign is fixed by assigning owner and dated next step, and state persists then resets
  ✓  31 [mobile] › desk.spec.ts:113:1 › keyboard: skip link and rail navigation work without a mouse
  ✓  32 [desktop] › desk.spec.ts:113:1 › keyboard: skip link and rail navigation work without a mouse
  ✓  33 [mobile] › desk.spec.ts:126:1 › trust page reports numerators, denominators and CRM gaps
  ✓  34 [desktop] › desk.spec.ts:126:1 › trust page reports numerators, denominators and CRM gaps
  ✓  35 [mobile] › desk.spec.ts:132:1 › incomplete evidence shows coverage and does not outrank evidenced campaigns
  ✓  36 [desktop] › desk.spec.ts:132:1 › incomplete evidence shows coverage and does not outrank evidenced campaigns
  36 passed
```

## Not yet run

- Assistive-technology testing with a real screen reader.
- Browsers other than Chromium.

## Walkthrough video validation (2026-10-06)

File: `docs/video/strategic-account-desk-walkthrough.mp4` (re-rendered after the scoring fix and the "weekly view" wording change). Output of `ffprobe` and `ffmpeg` filters on the final file:

```
stream|codec_type=video|width=1080|height=1920
stream|codec_type=audio
format|duration=143.895000|size=30873293
volumedetect: mean_volume -17.6 dB, max_volume -0.0 dB
silencedetect (-45 dB, >=1.0 s): one gap, 114.266 to 115.293 s (1.03 s, scene change)
grep -c "Monday" captions: 0
```

- Footage: real rendered UI recorded from a fresh demo state, highlighted cursor driven by real mouse events, cursor-centred zoom-ins on eight moments, including Kestrel's "Coverage 28% · 2 unknown".
- Captions: 51 cues burned in, generated from the same narration text as the audio; also shipped as `.srt`.
- Frames sampled and inspected: desk with coverage tags, Kestrel coverage zoom, capacity move to 9 of 9, blocked route toast, verified route ticket and cooldown, stale signal, brief gaps then recompose, stall moved to Find route, 9 of 9 trust tests and denominators, first 30 days.
- Container tags hold no encoder, path or tool strings.

## Live deployment checks (2026-10-06)

URL: https://cashpointsoulja.github.io/harmonic-strategic-account-desk/ (GitHub Pages, `gh-pages` branch, root; static build of `build/strategic-account-desk` at fbb7e36). Checked with fresh Playwright Chromium contexts: no cookies, empty storage, no login.

```text
desktop #/desk: load 200 refresh 200 h1="This week" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/account: load 200 refresh 200 h1="Account map" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/routes: load 200 refresh 200 h1="Warm routes" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/signals: load 200 refresh 200 h1="Signal desk" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/brief: load 200 refresh 200 h1="Five-sentence brief" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/momentum: load 200 refresh 200 h1="Campaign momentum" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/trust: load 200 refresh 200 h1="Trust and measurement" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop #/value: load 200 refresh 200 h1="Why this desk, and the first 30 days" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
desktop Kestrel coverage label=1
mobile #/desk: load 200 refresh 200 h1="This week" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/account: load 200 refresh 200 h1="Account map" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/routes: load 200 refresh 200 h1="Warm routes" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/signals: load 200 refresh 200 h1="Signal desk" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/brief: load 200 refresh 200 h1="Five-sentence brief" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/momentum: load 200 refresh 200 h1="Campaign momentum" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/trust: load 200 refresh 200 h1="Trust and measurement" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile #/value: load 200 refresh 200 h1="Why this desk, and the first 30 days" overflow=0px login=0 poppins=true logo=true axe=0 4xx=0 errors=0
mobile Kestrel coverage label=1
deep refresh h1: Five-sentence brief | JPMorganChase visible: true
request hosts: cashpointsoulja.github.io
```

Desktop is 1366×900; mobile is 390×844 with touch at DPR 2. "refresh" is a direct reload of the same hash route. Fonts and logo load from the Pages sub-path, and every request goes to the Pages host only. Rendered desk and trust screenshots at both widths were inspected: Kestrel shows "Coverage 28% · 2 unknown", and the trust page reads 9 of 9 pass.
