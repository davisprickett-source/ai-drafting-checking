---
project: ai-drafting-checking
task: Extract the AI drafting + consultant-checking engine into a standalone, language-agnostic, droppable project
effort: E3
phase: complete
progress: 24/24
mode: ALGORITHM
started: 2026-06-22
updated: 2026-06-22
---

## Problem

The AI drafting + consultant-checking system was built inside the `chadian-arabic` project and entangled with Chadian-Arabic data: hardcoded corpus paths, a Latin-only tokenizer, the orthography linter rules baked into `check-draft.ts`, an English+CA system-instruction block pasted into the protocol, and French/English assumed as the only languages of wider communication (LWC). It could not be handed to another translation team without rewriting code.

## Vision

A self-contained folder a translator can copy into ANY language project. Adding a language is a configuration task — write one profile JSON + a reference pack — never a code edit. The team's LWC can be anything (English, French, Spanish, Arabic, Swahili). The drafting instruction generates itself from the profile + references.

## Out of Scope

Authoring the expert reference pack for any specific language (that is per-team linguistic work); a hosted/automated drafting agent (the workflow stays human-driven, model-in-the-loop); changing the methodology (council, dossier, CONNOT taxonomy, flag levels) — only its portability.

## Constraints

bun + TypeScript only. Tools read one profile via `tools/lib/profile.ts`. The corpus-membership "growing linter" invariant is preserved: only human-confirmed forms enter `approved-additions.json`; the firewalled check set never enters drafting. Script-agnostic (must work for Arabic script, not just Latin romanization).

## Goal

`ai-drafting-checking/` contains the full engine with zero Chadian-Arabic artifacts; every tool is profile-driven and compiles; a new language is added by `profiles/<iso>.json` + `references/`; the system instruction auto-generates; and the whole thing is proven by copying it into the Darja project and drafting + verifying a real OT passage.

## Criteria

- [x] ISC-1: Standalone project at `~/Projects/ai-drafting-checking/` exists with tools/, profiles/, references/, multi-model/, consultant-check/, docs.
- [x] ISC-2: Shared `tools/lib/profile.ts` resolves the active profile (--profile / $LANG_PROFILE / single-profile auto-detect) and absolutizes all paths.
- [x] ISC-3: Tokenizer is Unicode-aware (`\p{L}`), not Latin-only — works for Arabic script.
- [x] ISC-4: `check-draft.ts` reads linter rules, density checks, suffixes, borrowings, vowels from the profile — no language-specific code.
- [x] ISC-5: All 15 path-dependent tools read corpus/lexicon/etc. from the profile, none hardcode `new-testament/chadian-arabic-*`.
- [x] ISC-6: New `generate-system-instruction.ts` builds the drafting prompt from profile + reference pack in the team's LWC.
- [x] ISC-7: `profiles/_template.json` documents the full extended schema (linter_rules, density_checks, incontext_patterns, structure_patterns, stopwords, vowels, core_word_pattern, book_aliases, paths.references).
- [x] ISC-8: 7 reference-pack templates exist in `references/_templates/`; `draft-annotation.md` + `translation-issues.md` carried over generic.
- [x] ISC-9: All docs (README, START-HERE, WORKFLOW, MODES, FOR-TRANSLATION-TEAMS, DRAFTING_PROTOCOL, multi-model/*, consultant-check/*) genericized — no CA content.
- [x] ISC-10: Every tool compiles (`bun build --target=bun`).
- [x] ISC-11: Anti: no engine `.ts` file hardcodes "Chadian"/"Allah"/"gaaʼid"/orthography rules.
- [x] ISC-12: System copied into `dz-darija-project/ai-drafting-checking/`.
- [x] ISC-13: Darja NT corpus (7946 verses) built from the project's content into `corpus/arq-nt-corpus.json`.
- [x] ISC-14: Algerian Darja profile `profiles/arq.json` authored with grounded MSA-leak linter rules + corpus-attested in-context patterns.
- [x] ISC-15: `build-lexicon` produced an 18,332-word Darja lexicon.
- [x] ISC-16: `build-incontext-pack` produced a pack with 120 core words + 10 pattern banks all matching real corpus verses.
- [x] ISC-17: `check-setup` reports 0 blocking for Darja.
- [x] ISC-18: `generate-system-instruction` produced a coherent Darja-specific drafting prompt.
- [x] ISC-19: Ecclesiastes 1 + 2:1-11 (29 verses) drafted in Darja.
- [x] ISC-20: `check-draft` ran on the draft: 0 errors (no MSA leaks), membership check surfaced OT/variant vocabulary.
- [x] ISC-21: `score-draft` produced per-verse confidence tiers.
- [x] ISC-22: `find-parallels` retrieved real corpus verses for an Arabic query (retrieval works on Arabic).
- [x] ISC-23: Anti: the linter produced no false-positive MSA-leak flags on genuine Darja text.
- [x] ISC-24: Test artifacts saved under `dz-darija-project/ai-drafting-checking/drafts/`.

## Test Strategy

isc | type | check | tool
ISC-3 | unit | Arabic tokens survive tokenization | build-lexicon on Darja corpus → non-zero unique words
ISC-4/5 | integration | tools run with only a profile, no code edits | run pipeline on Darja
ISC-10 | build | each tool compiles | bun build --target=bun
ISC-11/23 | anti | grep engine for CA terms; linter output has 0 error lines on clean Darja | grep + check-draft
ISC-20/21 | live | verifier produces sane output on a real draft | check-draft + score-draft

## Features

name | satisfies | notes
profile-loader | ISC-2 | tools/lib/profile.ts
unicode-tokenizer | ISC-3 | tools/lib/tokenize.ts
profile-driven-linter | ISC-4 | check-draft.ts rules/density/suffixes/borrowings from profile
path-parameterization | ISC-5 | all tools via loadProfile()
instruction-generator | ISC-6 | generate-system-instruction.ts
schema+templates | ISC-7,8 | _template.json + references/_templates/
docs-genericization | ISC-9 | all md
darja-deployment | ISC-12..18 | corpus build + profile + pipeline
darja-test | ISC-19..24 | Ecclesiastes draft + verify

## Decisions

- 2026-06-22: New project is a self-contained DROPPABLE FOLDER (matches Davis's "easy to copy within a project folder"). The standalone repo IS the folder; deploying = copying it in.
- 2026-06-22: Moved the orthography linter from `check-draft.ts` code into `profile.linter_rules[]`. This is the key portability win — the old "one code edit per language" step is now pure config. Adding `density_checks`, `incontext_patterns`, `structure_patterns` to the profile schema for the same reason.
- 2026-06-22: Tokenizer generalized from `/[a-z]/` to `/\p{L}/u`. Without this the entire Darja (Arabic-script) corpus tokenized to nothing — the single most important code change for true language-agnosticism.
- 2026-06-22: Chose `dz-darija-project` (has the NT for drafting, `nt-source/` + `content/`) as the deployment target, not `darja-translation` (literature site).
- 2026-06-22: Darja LWC = Arabic + French; divine name الله; hevel → باطَل (option: ريح). Linter rules target MSA/Fusha leaks (الذي→اللي, ليس→ماشي, هذا→هاد, لم/لن→ما...ش, سوف→رايح, لأن→خاطر, نحن→حنا, لكن→بصح, يريد→يحب) — grounded in the project's own dz-linguistic-analysis-report.md.
- 2026-06-22: Engineer subagent failed (worktree isolation can't reach a sibling project); did the tool edits in the main loop instead. Note for future: spawn non-isolated agents for cross-project file work.
- 2026-06-26: Model-agnostic abstraction added. The workflows now refer to abstract ROLES (`workhorse`/`deep`/`independent`), mapped to any vendor's models in `models.json` (+ `models.template.json`, `MODELS.md`). `estimate-cost.ts` is now config-driven (reads roster cost_units + tier→role mix). MODES.md and COUNCIL.md reframed: the Anthropic Opus/Sonnet/Haiku data is kept as the capability-tier *benchmark*, not a hardcoded lineup. Rationale: teams have different vendors/budgets, and cross-VENDOR disagreement is the council's whole value — so a role is reserved for a different vendor than the primary.
- 2026-06-26: Added `multi-model/RELAY.md` — chaining models in sequence (improve / adversarial / escalation relays), e.g. draft with one vendor then improve with another. Distinct from the parallel council.
- 2026-06-26: Added `tools/paratext-import.ts` + `SETUP.md` — the "drop into a Paratext folder and it works" on-ramp. Importer reads Settings.xml + USFM → verse-keyed corpus JSON, scaffolds the profile, ensures models.json. Tested: parses \id/\c/\v, strips char markers, grep-corpus works on the output immediately. `check-setup.ts` now also verifies the model roster.
- 2026-06-26: Ported the consultant-check v3 upgrades from the chadian-arabic working repo: LEXICAL GROUNDING gate (corpus lookup before any meaning-critique; severity gated on lexical confidence), AXIS tag (accuracy|fidelity|naturalness), DECIDED-BY tag (consultant|native speaker|team policy). Origin: a real misread where "beware" (g-r-ʕ) was flagged as "read" (g-r-ʼ) from surface resemblance; a second note mis-etymologized an established term the same way.

## Changelog

- conjectured: the attestation/membership metric would give a clean confidence signal for Darja drafts.
  refuted_by: 28/29 Ecclesiastes verses scored LOW — partly correct (OT vocabulary like cisterns/cattle/vineyards is legitimately absent from an NT corpus) and partly noise (Arabic optional harakat makes one word tokenize as several "variants": تحت vs تَحت).
  learned: attestation % is calibrated for stable-orthography romanized text; for Arabic-script languages with optional vowel diacritics it needs a normalization pass before it is a trustworthy confidence axis.
  criterion_now: a future `strip_marks` profile flag should drop `\p{M}` in the tokenizer (consistently across build-lexicon + check-draft + score-draft) so attestation reflects consonantal-skeleton membership, not diacritic accidents.

## Verification

- ISC-10: `bun build --target=bun` on all tools — "compile check done", no FAIL lines.
- ISC-15: build-lexicon — "7946 verses → 18332 unique words (111713 tokens, 10461 hapax)".
- ISC-16: build-incontext-pack — "120 core words, 10 pattern banks"; pattern banks contain real corpus verses (verified by eye).
- ISC-17: check-setup — "6 ok · 8 to-do · 0 blocking".
- ISC-20: check-draft — "0 error(s)", 121 unattested words listed (OT terms + harakat variants); exit 0.
- ISC-21: score-draft — "29 verses · HIGH 0 · MEDIUM 1 · LOW 28"; flags 1:1 (Qoheleth title) and 2:8 (concubines) as lowest, which is linguistically correct.
- ISC-22: find-parallels على الحِكمة → returned 1CO:1:22, 1CO:2:4, 1CO:2:6, 1CO:12:8 — real attested verses.
- ISC-11/23: grep of engine .ts for CA terms → only incidental comment strings (since fixed); check-draft produced 0 MSA-leak flag lines on the genuine Darja draft.
