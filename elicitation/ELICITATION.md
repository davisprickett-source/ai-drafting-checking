# Elicitation — the system as language learner

> Drafting consumes language knowledge; **elicitation produces it.** When the corpus is thin (see `bun tools/draft-readiness.ts`), when a genre has no exemplars, or when drafts pile up `⟨?⟩` and `⟨≈⟩` flags, the highest-value move is not another draft — it is asking the team the right questions and banking the answers as grade-A data. A good field linguist spends years on this; the system's job is to generate the *right* questions in the *right* order, in the team's LWC, and to make every answer permanently improve future drafting.

## Where elicitation questions come from (all of these are free)

| Trigger | What to elicit |
|---|---|
| `draft-readiness` shows a genre at ELICITATION-FIRST | that genre's register: how does the language do poetic parallelism? exhortation? a curse? a proverb? |
| a draft's `⟨?⟩` flags | the missing word: "how do you say X?" — but asked *in context*, never as a bare wordlist item |
| a draft's `⟨≈⟩` flags | the better expression: "we can say X; is that what you'd say when Y, or is there a stronger way?" |
| `discover-term` comes up empty for a concept | the concept: unknown-idea strategies (specific term, generic, descriptive phrase, cultural substitute, loan) |
| a C-grade source describes a construction the corpus doesn't attest | confirmation: "the old grammar says you can say X-pattern; do people still say it? how would you write it now?" |
| the translation brief names a register/audience | register checks: "would an elder say it this way? would a teenager?" |

## The method (keep it natural, keep it grounded)

1. **Elicit in frames, not wordlists.** "How would you tell your neighbor that their sheep has been found?" beats "translate: find." Frames surface real grammar — aspect, evidentiality, participant marking — that citation forms hide.
2. **Non-biblical micro-texts are the engine.** Have the model draft tiny *non-Scripture* texts in the target language — a folktale opening, a market dialogue, a condolence, instructions for a task — and let the team correct them. Corrections to everyday text teach grammar and idiom exactly where Scripture drafting will need them, without touching the check-set or pre-deciding any verse. Every corrected micro-text is grade-A data: register it (`register-source.ts --type field-notes --grade A`).
3. **One question, one target.** Each question tests one thing (a construction, a word sense, a collocation). Bundle five targets into one question and the answer teaches nothing attributable.
4. **Always offer an out.** "…or would you say it completely differently?" — the team's reformulation is worth more than their yes.
5. **Bank everything.** Confirmed words → `approve-form.ts` (they become attestation). Corrected texts and answered question sets → `sources/<iso>/field-notes/` + `register-source.ts` (grade A). Then re-run `build-lexicon` (if the team agrees corrected texts should join the corpus) and `draft-readiness` — the bands should climb.

## Session shapes

- **Gap-filling session (30 min):** run `draft-readiness`, pick the weakest genre or the last draft's flags, generate 10–15 questions with `elicitation-prompt.md`, the team answers orally/in chat in their LWC, the assistant transcribes + banks.
- **Micro-text session:** model drafts 3 short non-biblical texts genre-matched to an upcoming book (e.g. poetic laments before drafting Lamentations); team corrects; corrections banked and mined for patterns.
- **Register session:** same content elicited for two audiences (formal/informal, old/young) to map register — feeds the style guide and the translation brief.

## Discipline

- Elicitation output is **team speech**, the most authoritative data the system will ever get — never let AI-generated forms enter the bank uncorrected (the growing-linter invariant applies with full force).
- The team's time is the scarcest resource in the whole system: questions must be triaged (readiness gaps and must-have terms first), batched, and never re-asked (log answered questions in the field notes).
- This doubles as translator growth, not dependence: the questions make explicit the linguistic choices a translator is already making by instinct — many teams find the elicitation log becomes their de facto grammar sketch.
