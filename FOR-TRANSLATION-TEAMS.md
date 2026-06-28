# For Translation Teams

> An AI-assisted toolkit for translating Scripture into a minority language **and** for consultant-checking a translation — built to be affordable (most checks are free), honest about uncertainty (it flags what it doesn't know at the right level), and portable to any language. It does the legwork; **the mother-tongue translator and the consultant keep the judgment.**

## What it's for, and who

| You are… | You use… | You get… |
|----------|----------|----------|
| a **translator / team** drafting | the **drafting workflow** | a *translation dossier* per verse: a proposed draft, real options where the text is open, flags for every uncertainty, the source, and the reasoning — editable, approvable, exportable to Paratext (USFM). |
| a **consultant / checker** reviewing | the **consultant-check workflow** | *CONNOT-tagged notes* per verse: the phrase in context, what the source says, proposed renderings, and the question to decide. |

Both workflows share one flag system, one taxonomy (CONNOT), and the same tiers — the only difference is whether you start from a draft you're making or a translation you're checking.

## The flag levels — uncertainty surfaced at the right granularity

The system never hides what it doesn't know. It flags at four levels, so a translator sees each kind of uncertainty where it belongs:

1. **Word level** — `word⟨?⟩`: this word may not be genuine in your language (unattested in the corpus, or a guess). The free linter computes this from the corpus.
2. **Phrase level** — `{A ⟂ B}`: a genuine choice with no single right answer (an idiom, a metaphor, a textual/interpretive fork, a measurement). Shown as options-with-reasons, never silently resolved.
3. **Verse level** — a confidence tier (HIGH / MEDIUM / LOW) with its reasons, so you know which verses to scrutinize first.
4. **Issue level** — a CONNOT category + severity (must-fix / discuss / minor): the consultant's standard vocabulary for *what kind* of issue it is.

A clean verse shows none of these. A hard verse shows several. That is the point: **the draft discloses its own doubt instead of looking falsely confident**, which is what keeps a translator thinking rather than rubber-stamping.

## The cost tiers
Match the spend to the need — see `MODES.md`. **L0 is free** (the verifier, corpus/structure search, rendering) and catches the mechanical layer at zero cost; reserve paid inference (L1–L3) for genuine judgment, and escalate per verse, not per chapter. `bun tools/estimate-cost.ts <verses>` shows the cost before you run.

## A team's day-to-day
1. **Set up once:** a language profile (`profiles/`) + your existing Scripture as the corpus → `build-lexicon`, `build-incontext-pack`. Build the reference pack (`WORKFLOW.md`).
2. **Draft a passage** at your chosen tier → read the dossier → edit the proposed draft, choose among options, resolve the questions → **approve** → export USFM to Paratext. Banked decisions teach the system (`approve-form`, `ingest-decisions`) so it improves with use.
3. **Or check a translation** (human or AI) → consultant notes → discuss with the team → record decisions.
4. **Always run the free checks** (`check-draft`, `grep-corpus`, `find-structures`) on anything — they cost nothing.

## The invariants (non-negotiable)
- **The human decides.** AI surfaces, categorizes, and proposes; it never imposes a rendering.
- **Firewall:** a published/reference translation used for checking is *never* fed into drafting (it would make the draft non-independent of the check).
- **The linter grows only on human-confirmed forms** — never on its own output, so it learns the language without certifying its own mistakes.

## Honest scope
This raises the floor and removes friction. It does **not** replace a mother-tongue translator's ownership of the language or a consultant's judgment — it makes one skilled human go much further, which for under-resourced languages is exactly the bottleneck worth attacking.

## Make it your language
Everything language-specific is config: see `profiles/README.md`. The method, tiers, flag levels, renderers, and most tools are language-agnostic — adding a language is configuration, not re-implementation.
