# Inference Tiers — match the cost to the need

> A translation team has limited budget. So every part of this system runs at a chosen tier, from **free** (deterministic checks, no AI) up to a **deep** multi-model pass. Pick the lowest tier that answers the question. The free tier alone catches a large share of mechanical errors at zero cost.

> **Model-agnostic.** The tiers below are written with the Anthropic family (Opus / Sonnet / Haiku) as the worked example because that's what was benchmarked — but the tiers actually run on **roles** (`workhorse`, `deep`, `independent`), which you map to any vendor's models in [`models.json`](models.json). Read "Opus" as "your `deep` model," "Sonnet" as "your `workhorse`," etc. Cost numbers come from each model's `cost_unit`; see [`MODELS.md`](MODELS.md) and `bun tools/estimate-cost.ts <verses>`.

| Tier | What runs | Inference | Use when |
|------|-----------|-----------|----------|
| **L0 — Free** | The verifier (`check-draft`), corpus/structure search (`grep-corpus`, `find-structures`, `find-parallels`), **concept→word discovery (`discover-term`)**, the lexicon membership + vowel-length + orthography + borrowing checks (all driven by the profile's `linter_rules`/`density_checks`), `score-draft`, `compare-drafts`, all rendering (`build-dossier`, `build-notes`). | **None.** Deterministic. | Always. Run on any draft or existing translation first. Catches orthography, related-language leaks, unattested words, missing key terms, structural patterns — for free. **Before flagging a concept as a lexical gap, run `discover-term` — the word is often already in the corpus under a synonym/another scene.** |
| **L1 — Light** | One model on the task: a single draft, or a single consultant review per verse. | ~1 agent/verse. Cheapest AI tier (Sonnet/Haiku ≈ 1 cost-unit). | First-pass drafting, or a consultant scan of a human translation, on a budget. |
| **L2 — Standard** | A lean council (Sonnet drafts + Sonnet synthesis) **+** a back-translation check. | ~2-3 Sonnet agents/verse (≈ 3 units). | Routine drafting where you want cross-checking + a meaning check but not Opus cost. |
| **L3 — Deep** | Full council (Opus + Sonnet + referee) **+** back-translation **+** the deep-analysis lenses (exegesis, naturalness, participant-reference, discourse, adversarial) **+** a consultant pass. | ~6-10 agents/verse, Opus-heavy (≈ 11+ units). | The hard verses: cruxes, poetry, disputed renderings, final pre-publication review. Escalate to L3 only where L0-L2 flagged a problem. |

## L1.5 — the draft-revise loop (best value, tested)

The highest-leverage mode sits between L1 and L2: **one agent drafts → the FREE verifier checks → the same agent revises from that evidence.** Because the checking layer (`check-draft` + a few `grep-corpus` lookups) costs nothing, a single cheap agent can self-correct to near-council quality.

Tested on a single hard verse (one Sonnet agent), in a representative low-resource language:
- Round 1 (draft only): **3 errors, 11 unattested words** (majority/related-language leaks — a wrong conjunction form, wrong prepositions, a marked consonant the orthography drops).
- Free verification produced the exact fixes (the attested conjunction form ×~1300 in the corpus vs the leaked form ×0; the attested preposition; the attested locative; and confirmed one phrase was already right).
- Round 2 (same agent, given that evidence): **1 error, 6 unattested** — and the corrected forms matched the *published* team translation.

So for a budget team, the recommended default is **L1.5**: draft with one model, run the free checks, feed the flags back for one revision. You get most of the council's quality for ~2 cheap agents instead of ~11 cost-units. Escalate to L3 only for the verses that are still genuinely open after the loop (cruxes, hard poetry — where the remaining flags are real gaps, like a missing word, not fixable by revision).

## Capability-tier benchmark (tested — Opus vs Sonnet vs Haiku)

> This is the empirical basis for the **roles**: a high model earns the `deep`/referee seat, a mid model is the `workhorse`, a low model isn't worth it for generation. One run, one language, the Anthropic family — re-run it on your own roster (`MODELS.md`) before trusting the mix; the free verifier makes that comparison cost nothing but the drafts.

Same blind prompts, two hard verses, scored by the free verifier + the published eval:

| Model | Quality | Token count | Per-token price | Verdict |
|-------|---------|-------------|-----------------|---------|
| **Opus** | **0 errors, cleanest** — best orthography, attested vocab, caught a 2nd-person address the others flattened, closest to the published team. | ~28k | highest (~15×) | The hard verses + the **referee/synthesis** role + final review. |
| **Sonnet** | 0 errors but leakier — a few majority/related-language particles and stray accents. The free-verify-revise loop cleans these cheaply. | ~24k | mid (~3×) | **The drafting workhorse.** Default with L1.5. |
| **Haiku** | **4 errors** + the most unattested words — heavy related-language interference, hyphenated suffixes, leaked auxiliaries. | ~24k | lowest (~1×) | **Not for generating the target language.** Token count isn't even lower, and the heavy errors eat any price saving in revision. OK only for mechanical sub-tasks. |

**Key takeaway:** cheaper-per-token ≠ cheaper-overall. Haiku used a *similar* token count to Sonnet but produced 4× the errors, so it costs more once you factor revision. The ideal workflow is **Sonnet drafting + the free-verify-revise loop, Opus for hard verses and the referee, and skip Haiku for generation.**

## The discipline
- **Start at L0 on everything.** It's free and catches the mechanical layer.
- **Escalate per verse, not per chapter.** Most verses are fine at L1; spend L3 only where the flags justify it. The deep tier exists for the ~10-20% that are genuinely hard.
- **Estimate before you run:** `bun tools/estimate-cost.ts <verse-count>` shows agents, tokens, and relative cost per tier. A full L3 chapter is ~10× an L1 chapter — know that before launching.
- **Lean on the free tier.** Re-running `check-draft`/`grep-corpus`/`find-structures` costs nothing; reach for an agent only when a human-judgment question remains.

## Why this matters globally
Minority-language teams often have little or no compute budget. A system that does its mechanical work for free and reserves paid inference for genuine judgment calls is one a small team can actually afford to run — which is the point.
