# Start Here — AI Bible-Translation Workflow

> You're in a Claude Code session inside this project. This is the entrypoint. Read this, then the workflow is ready to run.

## What this is
An experiment-grade, reusable workflow for AI-assisted Bible translation into any low-resource language. It produces not bare drafts but **translation dossiers** the human translator decides from. Everything language-specific is config (a language profile + a reference pack).

## The one rule you must not break 🔒
The published/reference translation (`paths.check_set` in your language profile) is the **CHECK set**. NEVER load it into a drafting session, and never copy its names/terms/wordings into `references/`. Drafts must be independent of the text we grade them against. Use it only to score finished drafts.

Be honest about what this firewall does and doesn't buy: it keeps the comparison **lexically** blind (the drafter never sees the target-language answer key), which is the part that matters for a minority language the model has never seen. It cannot make the comparison **content**-blind — every frontier model has the source text memorized in major languages, so it already "knows" what each verse should say. The experiment measures whether the model can say it *in your language*; interpret scores accordingly. The firewall is also procedural, not mechanical — an agent in this repo *can* read `check-set/` if told to, so the discipline is on you and your prompts.

## The map
- `DRAFTING_PROTOCOL.md` — the drafting loop + the exact reference load order. The drafting system instruction is auto-generated per language by `bun tools/generate-system-instruction.ts`.
- `references/` — the **drafting pack** (load these): common-errors (negative prompt), narrative-exemplars (positive prompt), draft-annotation (uncertainty/options/confidence markup), proper-names, key-terms, orthography, grammar, style-guide. Build them from `references/_templates/`.
- `profiles/` — your language profile (`profiles/_template.json` to copy; `profiles/README.md` documents every field).
- `multi-model/` — `COUNCIL.md` (run several models as a panel), `dossier-template.md` (the output spec + a worked schematic), `review-prompt.md`, `drafts/`, `corrections/`.
- `tools/` — `build-lexicon`, `check-draft` (`--lexicon` membership), `check-completeness` (negation/dropped-clause heuristics), `draft-readiness` (enough data to draft?), `find-parallels` (retrieval), `score-draft` (grounded confidence), `compare-drafts` (cross-model diff), `generate-system-instruction`, `register-source` (graded ingestion of any language data), `export-usfm` (approved draft → Paratext), `extract-reference-versions`. All read the profile.
- `sources/` + `elicitation/` — ingest any language data with quality grades; grow the language via gap-driven elicitation when data is thin (`bun tools/draft-readiness.ts` tells you which mode you're in).
- the LWC source parallel (a major-language Bible the team reads) lives under the profile's `paths.references`; the corpus and any back-translation live in your corpus directory.

## To draft a passage (the main task)
Type into this session (you're talking to the AI assistant running in Claude Code — "I" below is that assistant): **"Run the council on <passage>."** I will:
1. Spawn a **`deep`** drafter and a **`workhorse`** drafter from your `models.json` roster (each gets: the reference pack + source-language gloss + the LWC parallel, NOT the check set).
2. Ask you to run the same prompt on your **`independent`** model (a different vendor — its CLI or chat window) and drop its draft into `multi-model/drafts/`.
3. Verify + score + diff all drafts (`check-draft --lexicon`, `score-draft`, `compare-drafts`).
4. Synthesize a **dossier** (`dossier-template.md` shape): drafts, council arguments, options-with-warrants, confidence, LWC parallel, uncertainties, questions, resource pointers.
5. You make the final call; we bank your corrections in `multi-model/corrections/` as future few-shot data.

## Quickstart commands
```
bun tools/generate-system-instruction.ts                       # per-language drafting prompt (profile + refs)
bun tools/find-parallels.ts -k 8 <target-language content words> # exemplars for the passage
bun tools/discover-term.ts <gloss> <synonyms...>               # concept→attested target-language word (give synonyms!)
bun tools/grep-corpus.ts "<form>"                             # is this exact form attested?
bun tools/check-draft.ts <draft.json>                          # the linter (reads the profile's rules + lexicon)
bun tools/score-draft.ts <draft.json> --vs <other-draft.json>
bun tools/compare-drafts.ts multi-model/drafts/*.json
```

> **grep-corpus vs discover-term:** `grep-corpus` *verifies* a form you can already name; `discover-term` *discovers* an attested word for a concept you can't (searching the LWC parallel for the concept + synonyms, then surfacing the aligned target-language words). Use discover-term before ever flagging a "no word exists" gap.

## To reuse this for another language
See `WORKFLOW.md` — it has the generic-vs-specific split and a one-paragraph bootstrap prompt to re-instantiate the whole thing for a new language.
