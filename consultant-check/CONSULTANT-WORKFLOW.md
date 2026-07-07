# Consultant-Check Workflow — AI-assisted checking of a human translation

> A consultant-grade review of a *human* (team) translation, with the same rigor a translation consultant brings to a check, producing **CONNOT-categorized notes** per verse (the format your consultant's existing Paratext notes use, Paratext-compatible). The discipline mirrors the drafting side: **AI surfaces and categorizes the issues; the consultant decides.** It is not a replacement for a consultant — it does the legwork (back-translation review, consistency scans, flagging) so the human spends their judgment where it matters.
>
> This is portable: point it at any project's translation + back-translation. It shares the CONNOT taxonomy (`CONNOT-taxonomy.md`) and most of the tooling with the AI-draft system, so the same flag means the same thing whether it came from an AI draft or a human translation under review.

## Inputs
- **The translation under review** (target language, per verse).
- **A back-translation** if available (literal rendering into the LWC). If none, AI generates one (a different model than any that drafted).
- **The source** — Hebrew/Greek + a major-language version the team uses (the LWC).
- **The key-terms list** and any **prior consultant notes** (don't re-raise settled points).
- **A corpus / published Scripture** in the language, if any, for naturalness + consistency checks.

## The checking passes (each maps to CONNOT categories)
1. **Comprehension** — does it communicate the meaning? Generate comprehension questions (Co) and, where possible, check community answers. → `Clarity [Co]`, `Assumed information [Co]`.
2. **Accuracy** — back-translate, diff against the source. Flag additions, losses, distortions, wrong participants. → `Accuracy [Co]`, `Omission [Co]`, `Ambiguity [Co]`, `Participant reference [D]`.
3. **Naturalness** — does it read as normal speech? (corpus/lexicon if available). → `Naturalness [Co]`, `Lexical correspondence [L]`, `Orthography issues [RL]`.
4. **Key terms** — correct rendering + consistency across the book. Run the free pass first: `bun tools/check-consistency.ts <translation.json>` (anchored-form counts, variant renderings, concept-present/anchor-absent verses vs the LWC parallel) — then the human judges which variation is deliberate. → `Key biblical term [L]: <term>`, `Lexical correspondence [L]`.
5. **Exegesis / figures / discourse** — idioms, metaphors, rhetorical questions, figures; participant intro, cohesion, structure; textual/interpretive choices. → `[Rh]`, `[L] Idiom`, `[D]`, `[E]`.
6. **Culture** — unknown ideas, anachronism, mismatch, measurements. → `Unknown idea [Cu]`, `Cross-cultural mismatch [Cu]`.

## Output — one note record per issue (deep v2 format, see `reviewer-prompt.md`)
```
[<book c:v>]  <CATEGORY> [<code>]  ·  SEVERITY: must-fix | discuss | minor
  context:   "…<preceding text> ⟦<exact span>⟧ <following text>…"   (span shown IN its clause)
  issue:     <2–4 sentences: what's going on, why it's a question, the stake; name the mechanism>
  source:    <Hebrew/Greek form + literal gloss · the LWC · the source FEATURE driving it>
  options:   a) <target-language candidate> — "<English/LWC back-gloss>" — <warrant>
             b) <target-language candidate> — "<back-gloss>" — <warrant>      (2–3 candidates, never imposed)
  comprehension: <a field-testable question to check the meaning lands (Barnwell)>
  consistency:   <if relevant: does this recur in the book? flag for a consistency pass>
  discuss:       <the decision the consultant must make>
```
Upgraded from the v1 one-liner format on four axes the consultant asked for: **issue-in-context** (surrounding text, not just the span), **glossed options** (every candidate carries an English/LWC back-gloss so a non-speaker can weigh it), **fuller issue + discussion**, and **comprehension questions** per substantive note. A compact v1 record is still fine for a fast scan; v2 is the default for a real check. Exports to Paratext (verse → span → note).

## The flow
1. Load inputs. 2. Run the passes (the reviewer agent, `reviewer-prompt.md`; escalate hard verses to the deep lenses). 3. AI emits draft CONNOT notes per verse. 4. **The consultant reviews, edits, accepts/rejects** — they hold the judgment. 5. Accepted notes export to Paratext / log via `ingest-decisions.ts`-style capture; settled key-term decisions feed the consistency check so they aren't re-raised.

## Hook into the AI-draft side
An AI draft can be run through this exact consultant-check before it reaches the human — the dossier's flags ARE CONNOT-tagged. So the boundary between "checking an AI draft" and "checking a human translation" is just which text you load; the rigor and the taxonomy are identical.
