# Design scrape

What was captured from Harmonic Security's live properties before any app screen was built, and how. All reads happened on 2026-10-06 from a signed-out browser. Screenshots are kept in `docs/design/reference/` as reference evidence of third-party pages; they are Harmonic Security's material, not part of the desk.

## Pages captured

| Page | URL | Capture |
| --- | --- | --- |
| Marketing home, desktop 1366×900 | https://www.harmonic.security/ | `design/reference/site-d-full.png` (cookie banner declined) |
| Marketing home, mobile 390×844 | https://www.harmonic.security/ | `design/reference/site-m.png` |
| Interactive console, desktop | https://explore.harmonic.security/ | `design/reference/explore-UsageExplorer.png` (tour panel visible) |
| Interactive console, mobile | https://explore.harmonic.security/ | `design/reference/explore-m.png` |
| Brand kit | https://www.harmonic.security/brand | Logo SVGs and H-mark downloaded |
| Product pages | https://www.harmonic.security/products/explore, /products/guide, /products/command | Copy read for positioning (see research ledger) |
| About | https://www.harmonic.security/about | Board, investors, mission |

## Method

1. Headless Chromium (Playwright) loaded each page at 1366×900 and 390×844 and saved screenshots.
2. Computed styles were read from the live DOM:
   - `h1`: Poppins, 80px, weight 700, line-height 84.8px, letter-spacing −2px, white.
   - Primary CTA (`a[href="/get-demo"]`): background `rgb(78, 255, 121)`, text black, radius 50000px, padding 8px 20px, 14.4px / 500.
   - `body`: Poppins 16px, white text on `rgb(3, 43, 43)` (`#032b2b`).
3. CSS custom properties were read from the site stylesheet: beige `#efefef`, dark green `#043a3a`, green `#0a7979`, lime `#4eff79`, orange `#ff4f01`, purple `#7c8dfc`, yellow `#ffa300`, neutrals `#444`, `#262626`, `#121212`, white.
4. The console uses a system sans stack (computed `ui-sans-serif, system-ui`), so the desk keeps the marketing site's Poppins for brand consistency.

## Console patterns observed (explore.harmonic.security)

- Fixed dark left rail about 106 px wide; icon above label; active item filled dark teal with a bright green outline.
- Header row with account name, "Learn mode" toggle, "Tour" and a dark-green "Run a scenario" button.
- Mint strip: "Simulated environment, fictional data. Not all features enabled."
- Page title about 48 px bold, a one-line "View:" lede, then a "View by" sub-heading in purple.
- Filter chips ("All Usage Types", "AI API", "Native App"...) with a lilac selected state.
- White table card with risk pills (Medium peach, Low yellow, High pink) and an "Export CSV" button in a lilac pill.

## How the scrape shaped the desk

| Observation | Desk decision |
| --- | --- |
| Dark rail + green active outline | Same rail, same active treatment, eight desk sections |
| Mint simulated-data strip | Same strip, used for the synthetic-data and nothing-is-sent notice |
| Lilac filter chips | Account, campaign and signal-type pickers |
| Risk pills | Route, signal and stage status pills |
| Export CSV in console | Export button in the header with share/internal mode |
| Lime CTA on site | Primary actions (Export, Advance) |

## Not copied

No Harmonic product screens, data, copy blocks or icons were reused. Icons are simple line paths drawn for the desk.
