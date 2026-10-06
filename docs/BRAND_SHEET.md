# Brand sheet

The desk follows the look of Harmonic Security's public site and interactive product console, so a Harmonic seller would recognise it. It is an independent concept by Ayo Ahmed and is not affiliated with or endorsed by Harmonic Security. The Harmonic name and logo belong to Harmonic Security.

Sources read on 2026-10-06: <https://www.harmonic.security/>, <https://www.harmonic.security/brand>, <https://explore.harmonic.security/>. Method and raw observations are in [DESIGN_SCRAPE.md](DESIGN_SCRAPE.md). The visual guide is [design/brand-guide.html](design/brand-guide.html).

## Logo

| Use | File | Source |
| --- | --- | --- |
| Top-left of the app header (on #121212) | `public/assets/brand/Harmonic-Logo-White.svg` | `https://cdn.prod.website-files.com/6932186a6c06d62bc4b12891/6a7f759394f5a0a74bb12bff_Harmonic-Logo-White.svg` |
| Favicon | `public/assets/brand/Harmonic-H.svg` | Harmonic brand kit H-mark |
| Light backgrounds (docs only) | `Harmonic-Logo-Black.svg`, `Harmonic-Logo-Racing-Green.svg` | Harmonic brand kit |

The logo is used unmodified, at 28 px tall, with the non-affiliation notice beside it on desktop and directly under it on mobile.

## Colour tokens (exact values from the live site CSS)

| Token | Hex | Where the desk uses it |
| --- | --- | --- |
| Neutral darkest | `#121212` | Header bar and left rail (console rail colour) |
| Deep teal (site body) | `#032b2b` | Reference only |
| Dark green | `#043a3a` | Active rail item fill, priority badges, primary dark buttons, "Public sources" chip |
| Kryptonite / lime | `#4eff79` | Active rail outline, Export and Advance buttons (black text), text on dark green |
| Teal | `#0a7979` | Score bars, focus ring, verified-route border |
| Beige | `#efefef` | App canvas |
| Purple | `#7c8dfc` | Selected filter chip outline (never as text on white: 2.9:1) |
| Orange | `#ff4f01` | Stalled campaign border, failure and gap callouts |
| Yellow | `#ffa300` | Reference only; unknown-score hatch uses a lighter derivative |
| Neutral dark / darker | `#444` / `#262626` | Secondary text, labels |

Text colours were darkened where the console colour fails WCAG AA on white: links use `#3540a8` (8.2:1) instead of `#7c8dfc`; pill text uses dark tints (for example `#0b5230` on `#d3f3df`).

## Type

Poppins (SIL Open Font License, self-hosted from `@fontsource/poppins`, licence in `src/fonts/OFL-Poppins.txt`). Weights 400, 500, 600, 700. Page titles 40 px / 700 (console uses a large bold title); section titles 19 px / 700; body 15 px / 400; pills 12 px / 600.

## Components borrowed from the console

- Fixed dark left rail with icon + label items; the active item has a bright green outline.
- Mint information strip under the header ("Simulated environment, fictional data" in the console; here it states the synthetic-data and nothing-is-sent rules).
- Large bold page title with a one-line lede.
- White cards with 1 px `#e2e2e2` borders and 14 px radius.
- Rounded filter chips; selected chip is lilac with a purple ring.
- Soft status pills (risk, warning, ok, info) with dark text.
- Pill-shaped buttons; lime primary with black text, as on the site's "Get a demo" button (`rgb(78,255,121)` background, 50000px radius).

## Desk-specific additions

- A dashed lilac **Synthetic** chip on every fictional record, and a dark-green **Public sources · prospect hypothesis** chip on the real account.
- A hatched amber **Unknown** bar instead of a zero score.
- An orange border for stalled campaigns.
