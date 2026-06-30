# Chadian Arabic — Live Examples

Chadian Arabic (ISO: `shu`) is spoken in Chad and parts of Sudan. The NT was completed in 2019 after decades of translation work; the OT is in progress. These examples use the NT as the corpus for AI-assisted drafting and checking.

## Multi-model dossiers (1 Samuel 1)

Interactive HTML files comparing multiple model outputs for the same passage. Each dossier shows:
- Multiple model drafts side-by-side
- Red-highlighted words not in the NT corpus
- Confidence dots (green/yellow/red) with rationale
- Source Hebrew + French reference text
- Decision notes: which model choice was kept and why
- Approve button to build a USFM-ready working draft

Open locally in any browser — no server needed.

| File | Verses |
|------|--------|
| `1sam1-5.html` | 1 Samuel 1:5 |
| `1sam1-8.html` | 1 Samuel 1:8 |
| `1sam1-9-10.html` | 1 Samuel 1:9–10 |

## Consultant-check example (Jonah 1)

`jonah-1-notes.html` — AI-assisted consultant check of the **already-published 2019 Chadian Arabic OT translation** (Jonah 1:1–16). This demonstrates a different use case: using AI not to draft but to surface issues in a completed translation for team discussion.

The checker flagged a clause in 1:2 with no source basis, a verb that loses the adversarial force of the Hebrew, and several discourse and lexical discussion points — all tagged by CONNOT category (Exegesis/Discourse/Lexicon/Grammar) and severity (must-fix / discuss / minor).

These are draft consultant notes, not verdicts. A mother-tongue speaker and consultant still decide what to do with each flag.

## How these were produced

Using the `ai-drafting-checking` engine with:
- Profile: Chadian Arabic NT corpus (~7,900 verses)
- Constraint-injection via `generate-system-instruction.ts` (corpus-grounded drafting rules)
- Multi-model council: Sonnet + Opus in parallel, then synthesis
- Linter: `check-draft.ts` enforcing Chadian Arabic orthography rules (no SH→CH, no Q→G, max 2 successive identical vowels, etc.)
