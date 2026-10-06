# Data dictionary

Types live in `src/domain/types.ts`; seed data in `src/domain/fixtures.ts`.

| Entity | Field | Type | Meaning |
| --- | --- | --- | --- |
| Account | id, name, sector | string | |
| | synthetic | boolean | True for fictional fixtures. Only JPMorganChase is false |
| | profile, situation | string | Situation is sentence 1 of the brief |
| | fit.{regulated, publishedAiAdoption, enterpriseScale, sensitiveData} | boolean or null | null = unknown |
| | fitEvidence | map of factor → evidence id | |
| Evidence | sentence | string | One claim, quoted or paraphrased |
| | sourceTitle, sourceUrl | string, string or null | null for synthetic and hypotheses |
| | eventDate, accessed | ISO date | Publication/event date; date read |
| | confidence | high / medium / low | |
| | provenance | public-source / synthetic-fixture / analyst-hypothesis | |
| | kind | observed-fact / hypothesis | |
| Signal | type | leadership / ai-initiative / regulatory / event / news | |
| | sourceDate, shelfLifeDays | ISO date, number | Expiry = sourceDate + shelf life |
| | relevance | 1–5 | Relevance to AI governance |
| | whyNow, followOn | string | |
| Stakeholder | role | ciso / ai-platform / data-governance / procurement-legal / exec-sponsor | Committee seat |
| | publicName, nameEvidenceId | string or null | Only names the account publishes |
| | uncertain | boolean | Stripped from share exports |
| | authority | decides / influences / unknown | |
| | coverage | engaged / mapped / unknown | |
| Route | basis | verified-relationship / public-affiliation / hypothesis | |
| | synthetic | boolean | Synthetic demo route |
| | relationshipVerified, introducerPermission, recipientConfirmed | boolean | All three required to ask |
| | internalNote | string | Never exported in share mode |
| | lastAskedOn | ISO date or null | 30-day cooldown |
| Campaign | sellerId, ownerId | string, string or null | |
| | stage | map / route / brief / intro-prep / meeting-prep / engaged / stalled / parked | |
| | resumeStage | stage or null | Where a stall resumes |
| | nextAction, nextActionDate | string or null | |
| | slaDays, lastTouch | number, ISO date | |
| | eventPlan, introducerBriefRouteId, failureReason | string or null | |
| PrepTicket | kind | intro-request / event-invite | Body always says "not sent" |
| DeskState | version, today, … | | Persisted under `harmonic-strategic-account-desk:v1` in localStorage |
