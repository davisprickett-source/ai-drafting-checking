# Relay — chaining models in sequence (second-pass / cross-vendor hand-off)

> The council (`COUNCIL.md`) runs models **in parallel** and mines their disagreement. A **relay** runs them **in sequence**: model A produces something, model B works *on A's output*. Different question, different value. Use a relay when you want one model to improve, stress, or re-check another's work — e.g. *"draft with Claude, then hand it to Gemini to improve."*

## When to relay vs. council

| | Council (parallel) | Relay (sequential) |
|---|---|---|
| **Question** | "Where do independent attempts disagree?" | "Can a second model improve / break the first's output?" |
| **Input to each model** | the same source + references (blind to each other) | model B sees model A's actual output |
| **Best for** | exposing cruxes, catching one model's blind spots | polishing a near-final draft, adversarial re-check, a cheap-then-strong escalation |
| **Output** | a disagreement map → dossier | a revised artifact + a diff of what changed |

They compose: council to surface the hard spots, then a relay pass on just those.

## The three relay shapes

**1. Improve relay** — A drafts, B revises A toward higher quality.
```
roster-A workhorse  ─ draft ─▶  drafts/<passage>-A.json
                                   │  (+ the FREE verifier output: check-draft, grep-corpus)
roster-B (other vendor) ─ revise ─▶ drafts/<passage>-B.json
compare-drafts A B  ─▶  what B changed  ─▶  human adjudicates  ─▶  bank corrections
```
Give B the draft **plus the free L0 evidence** (the linter flags, corpus counts). B is not guessing whether A is wrong — it's revising against grounded evidence. This is the L1.5 verify-revise loop with a *different model* doing the revision, which adds a cross-vendor prior.

**2. Adversarial relay** — B's job is to *break* A, not improve it.
Hand B the draft and the `review-prompt.md` in **refuter mode**: "assume this rendering is wrong; say specifically how." Keep only the findings B can ground in the corpus or source. Survivors are real. (This is the deep-analysis "adversarial refuter" lens, run as a relay instead of inside one session.)

**3. Escalation relay** — cheap model first, strong model only on what it flagged.
`workhorse` drafts everything → free verifier + `score-draft` tag the LOW / disagreed verses → `deep` (often a different vendor) does a second pass on *only those*. Keeps strong-model spend proportional to difficulty.

## How to run one

Every reviewer/drafter prompt in this folder is paste-ready and model-agnostic, so a relay is just "save A's output, feed it to B":

1. **Produce A.** Run your `roster-A` model (subagent, or `gemini -p`, or a chat window per `MODELS.md` invoke method). Save to `multi-model/drafts/<passage>-<modelA>.json` in the standard verse-keyed format (see `README.md`).
2. **Run the free checks on A.** `bun ../tools/check-draft.ts --lexicon <profile paths.lexicon> drafts/<passage>-<modelA>.json` and a few `grep-corpus` lookups on anything flagged. This evidence rides along to B.
3. **Produce B over A.** Give `roster-B` (a *different vendor* — that's the point) A's draft + the verifier output + the same reference pack, with the instruction: *improve* (shape 1), *refute* (shape 2), or *revise only these verses* (shape 3). Save to `drafts/<passage>-<modelB>.json`.
4. **Diff.** `bun ../tools/compare-drafts.ts drafts/<passage>-<modelA>.json drafts/<passage>-<modelB>.json` → exactly what B changed. Each change is a cross-vendor disagreement to weigh.
5. **Adjudicate + bank.** A human (ideally mother-tongue) decides each change; banked decisions feed forward as few-shot (`corrections/`). This is the lever that compounds.

## Discipline (same invariants as everywhere)

- **The human decides.** B revising A is still a proposal, never an imposed fix. The diff is for a person to adjudicate.
- **Firewall holds.** Neither A nor B sees the published/reference translation (`paths.check_set`) during a drafting or improve relay. Reconcile against it only after the human has decided.
- **Ground every pass.** B is told to check the corpus/lexicon/LWC, not free-associate over A. Ungrounded "improvement" drifts toward fluent majority-language forms — the exact failure the free verifier catches.
- **A relay is not automatic quality.** A second model can make a draft *worse* (over-smoothing, leaking its own related-language priors). That's why step 4 (diff) and step 5 (human) are not optional — the relay surfaces changes; it does not bless them.
