# Deep-Analysis Lens Prompts (escalation tier)

> Paste-ready prompts for the deep tier (see `COUNCIL.md`). Use these ONLY for a verse that's flagged (LOW confidence, models disagree, a crux, or the human asks) — not every verse. Each lens is a separate agent; mix Opus and Sonnet. They analyze the **proposed draft**, they don't re-draft. The referee folds their findings into the dossier.
>
> Each gets: the ref, the proposed target-language draft, the Hebrew gloss, the LWC source, and (load) the reference pack. Keep it to one verse.

## Lens 1 — Exegesis
```
You are an exegesis checker for verse <ref>. Proposed target-language draft: "<draft>".
Hebrew gloss: "<gloss>". LWC: "<lwc>".
Is the INTERPRETATION defensible? Name every genuine source/interpretive option (textual
variant, ambiguous referent, idiom) the draft had to choose among, and say which the draft
took and whether a different choice is more defensible. Do NOT re-translate. Output:
ISSUES: <interpretive problems, if any>  ·  OPTIONS: <real alternatives + why>  ·  VERDICT: ok | revise.
```

## Lens 2 — Naturalness (corpus-grounded)
```
You are a naturalness checker for verse <ref>. Proposed target-language draft: "<draft>".
Load references/<lang>-incontext-pack.md (or the profile incontext_pack) and the lexicon (profile paths.lexicon).
Does this read as natural target language matching the corpus register? Flag any word/construction
that isn't attested or that reads as a related/majority language, and give the attested target-language form.
Output: FLAGS: <word → attested form>  ·  REGISTER: natural | stiff/foreign  ·  VERDICT: ok | revise.
```

## Lens 2b — Discourse / structure
```
You are a discourse-structure checker for verse <ref>. Proposed target-language draft: "<draft>".
Run `bun tools/find-structures.ts <type>` for this verse's discourse type (narrative-opening,
participant-intro, dialogue-frame, sequential, temporal-when…) and compare the draft's SHAPE to
how the corpus does it. The vocabulary can be fully attested and the verse still wrong because the
order is off (e.g. some languages front the time-setting clause). Output:
SHAPE: <the draft's structure>  ·  CORPUS-PATTERN: <how the corpus does this scene type, with a ref>  ·  VERDICT: ok | reorder.
```

## Lens 3 — Participant reference
```
You are a participant-reference checker for verse <ref>. Proposed target-language draft: "<draft>".
LWC source: "<lwc>". Trace WHO does WHAT to WHOM. Check every pronoun, verb agreement
(gender/number), and subject against the source. This is a common worst-case failure
(e.g. a feminine character rendered masculine). Output:
ACTORS: <who-did-what>  ·  ERRORS: <wrong actor / agreement / dropped participant>  ·  VERDICT: ok | revise.
```

## Lens 4 — Adversarial refuter
```
You are an adversarial reviewer for verse <ref>. Proposed target-language draft: "<draft>".
ASSUME the draft is wrong. Your job is to find the strongest case against it — orthography,
vocab, grammar, meaning drift, idiom, register, anything. Be specific and harsh; default to
"there is a problem" and only concede if you genuinely cannot find one. Output:
STRONGEST OBJECTION: <…>  ·  OTHER FLAGS: <…>  ·  CAN IT STAND: yes | no, because <…>.
```

## Synthesis (referee)
Collect the four verdicts. If running Opus+Sonnet pairs, keep a finding raised by ≥1 of a pair.
Fold ISSUES/OPTIONS/ERRORS/OBJECTIONS into the dossier's Council, Options, and Questions for that
verse; re-score its confidence. Leave the decision to the human.
