# Risks and limits

| Risk / limit | Effect | Mitigation in the desk |
| --- | --- | --- |
| All workflow assumptions come from a job posting, not interviews | Features may not match how the team really works | Labelled as hypotheses; personas and five whys say so |
| Real account names real executives from the company's own pages | Names may be out of date | Each name links to its source and date; the CISO name from a 2025 page is marked "current role unverified" and stripped in share mode |
| Real account could be read as a Harmonic target or customer | Misrepresentation | Labelled "prospect hypothesis, not a customer or confirmed target"; JPMorganChase does not appear among the customer logos on harmonic.security as read on 2026-10-06 |
| Route data in real use is sensitive | Leakage | Internal notes never leave in share mode; trust test checks it |
| Scores look precise | False confidence | Unknown shown as Unknown; weights visible; priority described as ordering, not forecast |
| Manual signal entry | Coverage gaps | Shelf life and dedupe keep what is entered honest; no scraping by design |
| Browser-local storage | Single user, single device; cleared with browser data | Stated on screen; export available |
| Fixed desk date | Ages do not move in real time | Deliberate for reproducibility; a real build would use today's date |
| Sentence splitter | Unusual abbreviations could miscount | Common abbreviations handled; unit tests cover "U.S." |
| Harmonic logo use | Trademark | Unmodified, with non-affiliation notice on every screen |
