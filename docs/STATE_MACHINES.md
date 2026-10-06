# State machines

## Campaign stage

```
map ──► route ──► brief ──► intro-prep ──► meeting-prep ──► engaged (set from CRM only)
 │        │         │           │               │
 └────────┴─────────┴───────────┴───────────────┴──► stalled ──► (resumeStage)
any active ──► parked ──► map (only if seller lane has room)
```

| Transition | Guard |
| --- | --- |
| any → next | owner set; dated next action; one step at a time |
| map → route | at least 3 committee seats mapped |
| route → brief | at least one route candidate |
| brief → intro-prep | brief ready (no evidence gaps) |
| intro-prep → meeting-prep | route gate passes and an intro-request ticket exists |
| meeting-prep → engaged | blocked on the desk: needs a CRM-recorded meeting |
| stalled → resumeStage | owner, dated next action, date not in the past |
| parked → map | seller has fewer than 3 active campaigns |
| active → stalled / parked | always allowed; records failure reason |

## Route gate

```
candidate ──(basis = verified-relationship)──► verified
verified ──(introducer permission)──► permitted
permitted ──(recipient confirmed)──► cleared ──(not asked in 30 days)──► askable
askable ──(prepare intro ticket)──► asked (lastAskedOn = today; cooldown starts)
```
Public affiliation and hypothesis routes never leave candidate, whatever the checkboxes say.

## Signal

```
entered ──► future (date after desk date)
        ──► unsupported (no source, or public claim with no URL)
        ──► usable (age ≤ shelf life) ──(time passes)──► stale
duplicate (same account + source + normalised headline) ──► refused
```

## Brief

```
composed ──(edit)──► edited ──(recompose)──► composed
ready ⇔ fresh sourced trigger ∧ stakeholder ∧ route ∧ owner ∧ dated action ∧ five single sentences ∧ no unverified relationship claim
```
