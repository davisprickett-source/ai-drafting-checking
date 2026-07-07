# AI Bible-Translation Workflow

An experiment-grade, **reusable** system for AI-assisted Bible translation into any low-resource language. It produces **translation dossiers** a human decides from (proposed draft + options + checks + reasoning), not bare drafts to rubber-stamp. Everything language-specific is config (a language profile + a reference pack); the engine is language-agnostic.

## Before you start (60 seconds)

- **How this is actually used:** an AI coding assistant (e.g. [Claude Code](https://claude.com/claude-code) — a terminal/desktop app where an AI agent reads files and runs commands while you talk to it) sits *inside this project* and drives the workflow; you converse, it does the terminal work. Anywhere a doc says "tell me…", "me" is that assistant. You can run the free tools without any AI, and the prompts are paste-ready for any chat model — but the smooth path assumes an agent.
- **Cost:** the deterministic layer (linter, corpus search, scoring, rendering) is free and offline. AI tiers cost whatever your model access costs — a chat subscription (~$20/mo tier works), API credit, or a local model. `bun tools/estimate-cost.ts <verses>` previews relative spend before any run; see the data/cost/safety section in [`SETUP.md`](SETUP.md).
- **OS:** developed on macOS/Linux. On Windows, run it under [WSL](https://learn.microsoft.com/windows/wsl/install) (Bun's supported path); Paratext stays on Windows — you only point the importer at the project folder.

## Start here

- **For a translation team / consultant (read this first):** [`FOR-TRANSLATION-TEAMS.md`](FOR-TRANSLATION-TEAMS.md) — what it does, the two workflows, the flag levels, the cost tiers, the invariants.
- **Install it (Paratext → working in minutes):** [`SETUP.md`](SETUP.md) — `paratext-import` bootstraps the corpus + profile from a Paratext folder; then pick your models and verify.
- **Bring your own models (any vendor):** [`MODELS.md`](MODELS.md) — the system is model-agnostic; map abstract roles (`workhorse`/`deep`/`independent`) to Claude, Gemini, GPT, or local in [`models.json`](models.json).
- **Cost tiers (free → deep):** [`MODES.md`](MODES.md) — match inference spend to the need.
- **Using it (drafting a passage):** [`START-HERE.md`](START-HERE.md) — open a Claude Code session and say *"run the council on \<passage\>"*.
- **Configuring it for your language:** [`WORKFLOW.md`](WORKFLOW.md) + [`profiles/README.md`](profiles/README.md) — fill a language profile (`profiles/_template.json`); the core stays language-agnostic.

## What's built (component map)

**Generic — ports to any language unchanged:**
- `DRAFTING_PROTOCOL.md` — the iterative loop, load order, tested context-loading strategy. The drafting system instruction is **auto-generated per language** by `bun tools/generate-system-instruction.ts` (reads the profile + reference pack).
- `multi-model/` — `COUNCIL.md` (the model council + deep-analysis escalation tier), `RELAY.md` (chaining models in sequence — draft with one, improve/refute with another), `dossier-template.md` (the output spec), `review-prompt.md`, `backtranslate-prompt.md`. All model-agnostic (roles, not model names).
- `models.json` (+ `models.template.json`, `MODELS.md`) — the model roster: abstract roles → any vendor's models. `tools/paratext-import.ts` — bootstrap corpus + profile from a Paratext project.
- `references/draft-annotation.md` — uncertainty / options / confidence markup.
- `references/_templates/` — fill-in-the-blank scaffolds for every reference-pack file (orthography, grammar, common-errors, key-terms, proper-names, narrative-exemplars, style-guide).
- `tools/` — `build-lexicon`, `check-draft` (the linter), `check-completeness` (negation-parity + dropped-clause heuristics vs the LWC parallel), `check-consistency` (book-wide key-term consistency — variant renderings + concept-present/anchor-absent verses), `draft-readiness` (does the system have enough data to draft? overall + per-genre), `build-elicitation` (question set → offline interactive HTML the team answers on a phone), `find-parallels` (retrieval by vocabulary), `find-structures` (retrieval by discourse shape), `grep-corpus` (how a form is really used), `score-draft` (grounded confidence), `compare-drafts` (cross-model diff), `build-dossier` (→ interactive HTML workspace), `build-incontext-pack` (corpus distillation), `generate-system-instruction` (per-language drafting prompt, includes the team's translation brief), `register-source` (ingest any language data with a quality grade — see `sources/README.md`), `export-usfm` (approved draft → Paratext, refuses unresolved flags), `extract-reference-versions`, `approve-form` (grow the linter), `ingest-decisions` (fold translator notes back in). All read the language profile.
- `sources/` — graded ingestion for **any** language data (dictionaries, grammars, articles, field notes, old wordlists): quality grades A–D + usage policies, with the hard line that enrichment never counts as attestation.
- `elicitation/` — the system as language learner: gap-driven question sets and non-biblical micro-texts that turn team answers into permanent, grade-A language data (this is how a one-book team grows into a drafting-ready corpus).

**Language-specific — supply per language (config, not code):**
- `profiles/<iso>.json` — the language profile (script, LWC, divine name, suffixes, borrowings, key-term anchors, **linter rules**, density checks, in-context/structure patterns, paths). Copy `profiles/_template.json`.
- `references/` — the reference pack (orthography, grammar, common-errors, key-terms, proper-names, narrative-exemplars, in-context-pack). Build from `references/_templates/`.
- the corpus (existing Scripture, verse-keyed JSON) + its frequency lexicon (regenerated by `build-lexicon`).
- the published/reference translation — 🔒 CHECK-ONLY (firewalled from drafting).

## Consultant-check (reviewing a human translation)

A second workflow lives in `consultant-check/` — AI-assisted **consultant checking** of an existing human/team translation, producing CONNOT-categorized notes (Barnwell/SIL) in the Paratext shape real consultant notes use:
- `CONNOT-taxonomy.md` — the standard consultant flagging vocabulary (shared with the AI-draft flags).
- `CONSULTANT-WORKFLOW.md` — the checking passes (accuracy, naturalness, key terms, discourse, culture).
- `reviewer-prompt.md` — the reviewer agent.

Same taxonomy and rigor as the drafting side — the only difference is whether you load an AI draft or a human translation. The consultant decides; the AI does the legwork.

## The two rules that matter most

- 🔒 **Never load the published/reference translation (`paths.check_set`) into a drafting session** — it's the answer key we grade drafts against.
- **The linter grows only on human-confirmed forms** (`approve-form.ts`), never on AI output — so it learns the language without certifying its own hallucinations.

## How it works, in one line

Retrieve real corpus examples → a council of different models drafts → a thorough linter checks orthography/vocab against the corpus → a back-translation checks meaning in the team's language of wider communication (LWC) → a referee synthesizes a proposed draft with its reasoning and open questions → the translator edits, approves, and exports to Paratext (USFM). Hard verses can be escalated to a deeper multi-lens panel on demand.
