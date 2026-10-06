# Architecture

```
index.html ─► src/main.tsx ─► src/App.tsx (views, hash routing)
                               │
                               ├─ src/ui/bits.tsx       pills, score bars, copy/download helpers
                               └─ src/domain/
                                    types.ts           entity types
                                    fixtures.ts        seed: 1 real account (public sources) + 8 synthetic
                                    logic.ts           pure rules: scores, gates, signals, brief, state machine, export, metrics
                                    trust.ts           live trust tests
                                    store.ts           localStorage load/save/reset
```

- **Static single-page app.** React 18 + TypeScript, built by Vite to `dist/` with relative asset paths (`base: './'`), so it runs from any sub-path (GitHub Pages) and from `file://`-like previews.
- **Hash routing** (`#/desk`, `#/brief/c-jpmc`): direct refresh works on static hosts without rewrite rules.
- **Pure domain layer.** Every rule is a pure function of `DeskState`, unit-tested without a browser. The UI never writes state except through these functions.
- **State.** One `DeskState` object in React state, saved to `localStorage` on every change, versioned (`v1`); corrupt or old data falls back to the seed. Reset removes the key.
- **Fixed desk date** (2026-10-06) so scores, expiry and reminders are reproducible in demos and tests.
- **No network calls** at runtime other than loading the app's own files. External source links open in a new tab.
- **Exports** are generated client-side as Markdown blobs.
- **Fonts** are self-hosted Poppins (OFL). Logo SVGs are Harmonic Security's public brand-kit files.
- **Hosting.** `.github/workflows/pages.yml` builds and deploys `dist/` to GitHub Pages. No server, Worker or secret is required.
