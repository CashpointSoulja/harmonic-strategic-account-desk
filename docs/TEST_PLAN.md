# Test plan

| Layer | Tool | What | Command |
| --- | --- | --- | --- |
| Types | TypeScript strict | all source, tests | `npm run typecheck` |
| Lint | ESLint + typescript-eslint + react-hooks | src, test, e2e | `npm run lint` |
| Unit | Vitest | scoring, unknowns, signals (stale, boundary, unsupported, dedupe), route gate and cooldown, sentence splitting, five-sentence boundary, overclaim, state machine, capacity, tickets, trust tests, metrics, share export, local state | `npm test` |
| Build | Vite | production bundle with relative paths | `npm run build` |
| End-to-end | Playwright (Chromium), desktop 1366×900 and mobile 390×844 | every view renders, logo and notice visible, no horizontal overflow, axe WCAG 2 A/AA no serious/critical, capacity overflow, route gate, signals, brief boundary, exports, stall fix, persistence and reset, keyboard | `npm run e2e` |
| Visual | Playwright screenshots, inspected by eye | all 8 views at both widths | `docs/screens/` |
| Live | curl + Playwright against the deployed URL | 200s, direct refresh, signed-out, mobile | recorded in TEST_RESULTS.md |

Contrast is checked by axe (color-contrast rule, WCAG AA).
