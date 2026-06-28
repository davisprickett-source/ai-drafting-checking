# Multi-Model Drafting & Review Workflow

> Scaffolding for using several AI models together on a target-language draft. The design principle (see the project thinking notes): **mine model *disagreement*, not clone *consensus*.** Different models (Claude, Gemini, etc.) have different training and fail in different places, so where they disagree is exactly where a human or the corpus should look. N copies of one model voting is theater.

## The flow

```
        ┌─ Claude session ─┐
draft ─▶│  Gemini CLI      │─▶ each produces a draft (or a review)
        └─ (other model)  ─┘            │
                                        ▼
                          tools/compare-drafts.ts  ──▶ disagreement map
                                        │
                                        ▼
                          human adjudicates disagreements
                                        │
                                        ▼
                          corrections banked  ──▶ feed back as few-shot
                                                  (the compounding lever)
```

1. **Draft** — one or more models each draft the passage, each following `../DRAFTING_PROTOCOL.md` (load the language profile `profiles/<iso>.json` + reference pack + lexicon + exemplars; see `profiles/_template.json` and `profiles/README.md` for config). Save each as a verse-keyed JSON (format below) under `drafts/`.
2. **Review** — independent models review a draft using `review-prompt.md` (model-agnostic; paste into Gemini CLI, a fresh Claude session, etc.). Each reviewer loads the references and the verifier output and returns structured findings.
3. **Compare** — `bun ../tools/compare-drafts.ts drafts/A.json drafts/B.json …` aligns by verse and surfaces where drafts disagree. Disagreements are the priority review targets.
4. **Verify** — run `bun ../tools/check-draft.ts --lexicon <profile paths.lexicon> drafts/*.json` on every draft. (Orthography/leak rules are pure config in the profile's `linter_rules[]` array — no code edit.)
5. **Adjudicate** — a human (ideally a mother-tongue speaker) decides each disagreement and each flagged issue.
6. **Bank the corrections** — every human decision goes into a growing example bank (`corrections/`) and is fed back as few-shot context for the next passage. This is the one mechanism that compounds; it is how the system gets better with use rather than staying at a fixed quality.

## Standard draft format (`drafts/<book>-<chapter>-<model>.json`)

```json
{
  "passage": "[Book chapter]",
  "model": "<model-id>",
  "date": "2026-06-16",
  "verses": {
    "<Book>:1:1": "…target-language text…",
    "<Book>:1:2": "…"
  }
}
```

Verse keys match the reference DB format (`Book Name:chapter:verse`), so a draft can be diffed directly against the team's LWC parallel (the profile's LWC reference under `paths.references`) and (once acquired) the published/reference translation (`paths.check_set`).

## Why separate sessions/models

- **Independence.** A reviewer in a fresh session with no memory of the drafting rationale catches what the drafter rationalized away.
- **Different priors.** One model caught things another missed and vice versa (observed). Cross-model review exploits that.
- **Grounding, not opinion.** Every reviewer is told to check against the corpus, the lexicon, the LWC parallel, and the back-translation — not to free-associate. Ungrounded multi-agent debate converges on fluent-but-wrong majority-language forms; grounded review does not.

## Files
- **`COUNCIL.md`** — the full council protocol (drafters + referee, how to run Opus/Sonnet/Gemini).
- **`dossier-template.md`** — the optimal output spec + a worked example.
- `review-prompt.md` — paste-ready, model-agnostic reviewer instructions.
- `drafts/` — model drafts (verse-keyed JSON), e.g. the artifacts from a real council run.
- `corrections/` — banked human decisions (the few-shot bank).
