# Drafter Prompt (council seat) — paste-ready, model-agnostic

> The prompt each council drafter gets — `deep`, `workhorse`, or the `independent` vendor's CLI/chat window. Every drafter receives the **same** package so the drafts are comparable and the disagreements meaningful. Never include the check-set (`paths.check_set`) or another drafter's output.

## Assemble the package (in this order)

1. The **generated system instruction** — `bun tools/generate-system-instruction.ts --profile profiles/<iso>.json` (orthography rules, borrowings, key terms, names, honesty + annotation mandates, all from your profile).
2. The **always-on primer**: `<lang>-common-errors.md` (negative prompt, weight it), the in-context pack, key-terms, proper-names.
3. **Passage exemplars**: output of `bun tools/find-parallels.ts -k 8 <content words>` — real corpus verses for this scene.
4. The **source block** below.

## Prompt template

```
<the generated system instruction>

<primer + exemplars>

TASK: Draft the passage below in <LANGUAGE> (<iso>), verse by verse.

SOURCE
  Passage: <book c:v–v>
  Hebrew/Greek gloss: <word-by-word gloss + any textual crux>
  LWC parallel (<profile.lwc[0]>): "<the LWC text>"

RULES OF THE DRAFT (in addition to the system instruction)
  - Ground every non-trivial word in the corpus: reuse forms from the exemplars
    above; if you are not sure a word is genuine <LANGUAGE>, mark it ⟨?⟩ — never
    invent a plausible-but-foreign form silently.
  - If a word is genuine but feels like a broad/flat fit for a precise or vivid
    source concept — workable, not optimal — mark it ⟨≈⟩ (research candidate).
    ⟨?⟩ = "may not exist"; ⟨≈⟩ = "exists, but a mature speaker may say it better".
  - Where the text is genuinely open (idiom, metaphor, measurement, textual crux,
    unknown concept), give 2–3 options {A ⟂ B} each with a one-line warrant.
    Do not resolve real forks yourself.
  - Do NOT consult any published translation in <LANGUAGE>. Draft from the source
    + the corpus evidence in this prompt only.
  - Do not inflate certainty. An honest ⟨?⟩ outranks a fluent guess.

OUTPUT — strict JSON, one entry per verse:
{
  "<BOOK>:<c>:<v>": { "draft": "<the verse, with ⟨?⟩ / {A ⟂ B} / ⟦crux note⟧ markup>",
                      "notes": "<1-2 lines: choices made, questions for the team>" }
}
```

Save each drafter's output to `multi-model/drafts/<passage>-<role-or-model>.json`, then verify/score/diff per `COUNCIL.md` step 2–3.
