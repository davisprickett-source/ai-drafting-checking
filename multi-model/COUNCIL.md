# The Model Council

> A panel of different models drafts, critiques, and a referee synthesizes — producing not a single draft but a **translation dossier** (see `dossier-template.md`) that lays out the decision for the human translator. The council exploits the one thing a single model can't give you: **cross-model disagreement**, which marks exactly the spots that need a human.

> **Model-agnostic.** This doc names roles — **workhorse**, **deep**, **independent** — not specific models. You map roles to your own models (any vendor) in [`models.json`](../models.json); see [`MODELS.md`](../MODELS.md). The `independent` role is deliberately a *different vendor* than your primary, because the disagreement is the point. For running models **in sequence** (e.g. draft with one, improve with another), see [`RELAY.md`](RELAY.md).

## Why a council (not one model, not clones)

A live run on one hard verse showed why this works. Given identical rules and source:
- **Model A** chose an aspect-marker the corpus supports, and used a receptor-natural idiom for the key clause.
- **Model B** leaked a related-language auxiliary that the project's linter flags, and kept a source-image calque.
- Both independently surfaced the same textual crux and offered it as options-with-warrants.

One model alone, you'd never see that the aspect choice is contested or that the related-language auxiliary slipped in. The disagreement *is* the finding. Clone-voting (same model ×N) would not produce it.

## Roles

| Role | Who (council seat → your model via `models.json`) | Job |
|------|-----|-----|
| **Drafters** | `workhorse` + `deep` (subagents) and `independent` (a different vendor — you run its CLI / chat) | Each independently drafts the passage from the SAME reference pack — never the published/reference translation (CHECK-ONLY) — with annotation markup (`⟨?⟩`, `{A ⟂ B}`, warrants). At least one drafter should be the `independent` vendor so the panel isn't single-vendor. |
| **Referee** | `deep` (the primary session, or a dedicated `deep` pass) | Does NOT pick a "right answer." Runs the verifier/scorer on each draft, diffs them, and synthesizes the **dossier**: the drafts, the arguments, the recommended rendering with its warrant, options, confidence, LWC parallel, uncertainties, questions, resource pointers. |
| **Approver** | the human translator | Uses the dossier to approve/edit. The council informs; it never decides. |

## The flow

```
1. DRAFT (independent, parallel)
   ├─ deep        (subagent) ─┐
   ├─ workhorse   (subagent) ─┤ each: reference pack + source (gloss + LWC), NO check set
   └─ independent (your CLI) ─┘ → save each to multi-model/drafts/<passage>-<model>.json
2. VERIFY each:  bun tools/check-draft.ts --lexicon <profile paths.lexicon> drafts/*.json
                 bun tools/score-draft.ts drafts/<a>.json --vs drafts/<b>.json
3. DIFF:         bun tools/compare-drafts.ts drafts/*.json   → disagreements = priority
4. SYNTHESIZE:   referee writes the dossier (dossier-template.md) per verse
5. APPROVE:      translator reads the dossier, makes the final call, banks corrections
```

## How to run it inside a Claude Code session

In a fresh session in this project, tell the assistant: *"Run the council on <passage>."* The referee then:
1. Spawns a **deep** drafter and a **workhorse** drafter (Agent tool, models read from `models.json` — e.g. `model: opus` / `model: sonnet` on the `claude` roster), each with the condensed rules + source + curated exemplars (the `drafter-prompt.md` pattern — same shape used in the live run).
2. Tells you to run the **independent** vendor (whatever non-subagent model fills that role — `gemini -p …`, a GPT chat, etc.) with the same prompt, and paste its draft into `multi-model/drafts/`.
3. Runs `check-draft`, `score-draft`, `compare-drafts` on all drafts.
4. Writes the **dossier** for the passage.

The `independent` seat stays a manual step on purpose: it's a genuinely different vendor (the most independent voice). If your whole roster is subagent-callable, the referee can spawn all three; the disagreement value comes from *vendor diversity*, not from who launches them.

## The referee's discipline (critical)

The referee must **not manufacture consensus or invent a target-language "correct" form**. Its job is to make the decision *legible*:
- Where models agree and the verifier is clean → mark HIGH confidence, recommend it.
- Where they disagree → show both, name the warrant for each, recommend on stated grounds (e.g. "Model A's corpus-supported aspect-marker over Model B's related-language auxiliary — the auxiliary is a linter-flagged leak"), but leave the final call to the human.
- Where it's a real crux (textual, idiom) → present options, do not collapse them.
- Reconcile against the published/reference translation (CHECK-ONLY) only AFTER the human has decided, never during synthesis.

## Two tiers: standard, and deep analysis on demand

Running a big panel on every verse wastes inference. So the council has two tiers, and the deep one is opt-in.

**Standard tier (every verse).** Opus + Sonnet draft, the verifier + `score-draft` run, one back-translation. Cheap. Handles the ~80% of verses that aren't hard.

**Deep tier (escalation — only when triggered).** Fires for a verse when ANY of:
- `score-draft` tags it LOW, or the models disagree (`compare-drafts`),
- it hits a known crux (textual variant, rare construction, unresolved idiom),
- the human flags it.

The deep tier is **not "more drafts."** It's distinct *lenses*, each a separate agent (mix Opus/Sonnet), because diverse perspectives catch what redundancy can't:
- **Exegesis** — is the interpretation defensible? what are the real source/interpretive options?
- **Naturalness** — does it read as natural target language? (grounded in the corpus + exemplars)
- **Participant reference** — who did what to whom? (the worst failure class — wrong participant)
- **Adversarial refuter** — actively try to break the proposed rendering; assume it's wrong, and say how.

Optionally run each lens as an Opus+Sonnet pair and keep a finding only if ≥1 of the pair raises it. The referee folds the deep findings into the dossier's Council / Options / Questions, and the verse is re-scored.

**Invoke (live session):** say *"deep-analyze <verse>"* → the session spawns the lens panel for that one verse. Default off; escalate only when the cost is worth it. This keeps inference proportional to difficulty.
