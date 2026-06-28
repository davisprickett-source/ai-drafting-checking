# Models — bring your own, any vendor

> This system is **model-agnostic**. The workflows refer to abstract **roles**, never to a specific model. You map each role to whatever you have — Anthropic, Google (Gemini), OpenAI (GPT), xAI (Grok), or a local model — by editing one file: [`models.json`](models.json). Nothing else changes.

## Why roles, not model names

Two reasons, both from how translation teams actually work:

1. **Different budgets, different access.** One team has a Claude Max subscription; another has a Gemini API key and nothing else; another runs a local model on a seminary laptop with no internet. The *method* is the same for all of them. So the method names roles; you supply the models.

2. **Disagreement is the signal, so vendor diversity is a feature.** The multi-model workflow (`multi-model/COUNCIL.md`) exists to mine where models *disagree* — that's where a human or the corpus should look. N copies of one model voting is theater. So one role is explicitly reserved for a *different vendor* than your primary.

## The roles

| Role | What it does | Capability / cost | Typical model |
|------|--------------|-------------------|---------------|
| **workhorse** | Routine drafting and per-verse review — the tier you run most. | mid capability, low cost | Sonnet · Gemini Flash · GPT-5-mini |
| **deep** | Hard verses (cruxes, poetry), the **referee/synthesis** role, final review. | high capability, higher cost | Opus · Gemini 2.5 Pro · GPT-5 |
| **independent** | A **different vendor** from your workhorse/deep, to mine cross-model disagreement (the generalized "Gemini slot"). | high capability; its value is *difference* | whatever vendor your primary is NOT |
| **fast** *(optional)* | Mechanical sub-tasks only — never generating the target language. | lowest | Haiku · Flash-Lite |
| **local** *(optional)* | Offline / zero-marginal-cost. Quality varies by language; verify hard with the free L0 tools. | varies | Ollama (Qwen, Llama) |

Only `workhorse`, `deep`, and `independent` are required. Omit the optional roles if you don't have them.

## How to set it up

1. `cp models.template.json models.json` (a starter `models.json` ships with a Claude roster + Gemini as the independent vendor).
2. Pick or edit a **roster** under `rosters`. Each role entry is:
   ```json
   { "provider": "google", "model": "gemini-2.5-pro", "capability": "high", "cost_unit": 3, "invoke": "cli", "cli": "gemini -p" }
   ```
   - **provider / model** — set `model` to whatever id your account currently offers (these churn).
   - **capability** — `low | mid | high`. Keep `deep` ≥ `workhorse`. Never put a `low` model on a generation role.
   - **cost_unit** — relative per-agent output-price weight. Set Sonnet = 1 as the baseline and scale others to it. This drives `estimate-cost.ts`.
   - **invoke** — *how you call it*: `subagent` (spawned inside a Claude Code session), `cli` (you run a CLI and paste the result), `api` (a script calls the API), or `manual` (you drive a chat window).
3. Set `active_roster` to the roster you want. Switch vendors any time by changing that one string.
4. `bun tools/estimate-cost.ts 30` — confirm the cost table reflects your roster. `--roster <name>` previews another without switching.

Shipped rosters you can use as-is or copy: `claude`, `gemini-only`, `openai-only`, `mixed-budget`, `local-first`.

## Invocation methods — how a non-subagent model joins a run

The system was born inside Claude Code, where `workhorse`/`deep` can be **subagents**. But any role can be a model you drive yourself:

- **`cli`** — run e.g. `gemini -p "<the prompt>"` in your own terminal, save the output to `multi-model/drafts/<passage>-<model>.json`. The prompts in `multi-model/review-prompt.md`, `multi-model/backtranslate-prompt.md`, and the drafter prompt are all **paste-ready and model-agnostic** for exactly this.
- **`api`** — a small script calls the provider's API with the same prompt. (Not bundled — providers differ; the prompts are the portable part.)
- **`manual`** — paste the prompt into a chat window (ChatGPT, Gemini, Claude) and save the reply.

The runner only needs to know *that* a role is non-subagent so it can pause and tell you to run it. The actual call is yours — which keeps the system independent of any one vendor's SDK.

## Relay / second-pass (chaining vendors)

Davis's case: *run a draft through Claude, then hand it to Gemini to improve.* That's a **relay** — see `multi-model/RELAY.md`. In short: roster-A produces a draft or review; roster-B does a *second pass* over A's output (improve, or adversarially review); `compare-drafts.ts` surfaces what B changed; the human adjudicates. Because each pass is a separate model on the *same* grounded prompt, B's edits to A are themselves a disagreement signal.

## The empirical benchmark (one data point, Claude family)

The tested numbers in `MODES.md` come from one real run on a low-resource language with the Anthropic family (Opus / Sonnet / Haiku). Treat them as a **reference benchmark for the *roles***, not a claim about specific vendors:

- A **high**-capability model (there: Opus) drafted cleanest and is worth the `deep` + referee slots.
- A **mid** model (there: Sonnet) is the right `workhorse` — and the **free verify-revise loop (L1.5)** closes most of its quality gap cheaply.
- A **low** model (there: Haiku) produced 4× the errors at a *similar* token count, so it was not worth it for generation — only mechanical sub-tasks.

The lesson is about capability tiers and the free-verification loop, and it should hold across vendors — but **re-run the comparison on your own roster and language** before trusting the mix. The free L0 verifier makes that comparison cost nothing but the drafts.
