# Setup — from a Paratext project to a working install

> Goal: drop this toolkit next to a Paratext project and have it working in a few commands. Everything language-specific is config (one profile + a reference pack + your model roster); the engine never changes. No inference is needed for setup.

## Prerequisites
- [Bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`). All tools run with `bun`.
- Your existing Scripture in **Paratext** (USFM files + `Settings.xml`) — this becomes the corpus the whole system grounds on.
- Access to at least one AI model (any vendor). See [`MODELS.md`](MODELS.md).

## The fast path (Paratext → ready)

```bash
# 1. Bootstrap corpus + profile straight from a Paratext project folder
bun tools/paratext-import.ts --from "/path/to/MyParatextProject" --iso xyz
#   → reads Settings.xml (language, versification), parses the USFM books into
#     corpus/xyz-corpus.json, scaffolds profiles/xyz.json, ensures models.json exists.

# 2. Build the frequency lexicon from that corpus (free, deterministic)
bun tools/build-lexicon.ts --profile profiles/xyz.json

# 3. Pick your models (any vendor) — edit active_roster + ids
cp models.template.json models.json   # if not already created by step 1
$EDITOR models.json                    # see MODELS.md

# 4. Verify the install
bun tools/check-setup.ts --profile profiles/xyz.json
```

`check-setup` tells you what's ready and what's still to-do (it now also checks your model roster). When it says **Fully set up** — or **Usable** with only `!` items — you can draft or check.

## Then fill the language-specific config

The importer scaffolds a profile but cannot know your orthography or grammar. Fill these (all config, no code):

1. **`profiles/xyz.json`** — script, `lwc`, `divine_name`, `suffixes`, `borrowings`, `key_terms_anchor`, and the `linter_rules` / `density_checks` that catch related-language leaks and orthography slips. Field-by-field docs: [`profiles/README.md`](profiles/README.md).
2. **The reference pack** in `references/` — orthography, grammar, common-errors, key-terms, proper-names, narrative-exemplars. Fill-in scaffolds are in `references/_templates/`. See [`WORKFLOW.md`](WORKFLOW.md).
3. **Build the in-context pack:** `bun tools/build-incontext-pack.ts --profile profiles/xyz.json` (distills the corpus into drafting context).

The more of the profile + reference pack you fill, the more the free L0 checks catch before you spend any inference.

## The firewall (do this consciously)

If you have a **published or reference translation** you'll check drafts against, import it as a **check-set**, never as the corpus:

```bash
bun tools/paratext-import.ts --from "/path/to/ReferenceText" --iso xyz --as-check-set
```

It writes to `check-set/` and is **never loaded into drafting** — it's the answer key you grade drafts against. Loading it into drafting would make the draft non-independent of the check. `check-setup` confirms the firewall is in place.

## Choosing how much to spend

- Read [`MODES.md`](MODES.md): L0 (free) → L3 (deep). Run the **free L0 checks on everything** first.
- Map roles → your models in [`models.json`](models.json) ([`MODELS.md`](MODELS.md)). Roles are abstract (`workhorse`/`deep`/`independent`); swap vendors by editing one line.
- Preview cost before any run: `bun tools/estimate-cost.ts <verses>` (reads your roster).

## Two ways to work
- **Drafting** a new translation → [`START-HERE.md`](START-HERE.md) / [`DRAFTING_PROTOCOL.md`](DRAFTING_PROTOCOL.md) → council ([`multi-model/COUNCIL.md`](multi-model/COUNCIL.md)) or relay ([`multi-model/RELAY.md`](multi-model/RELAY.md)).
- **Checking** an existing translation → [`consultant-check/`](consultant-check/) → CONNOT-tagged notes with AXIS / severity / who-decides triage.

## Your data, cost, and safety (read before running any AI tier)

- **What stays on your machine:** everything in L0 — the corpus, lexicon, linter, search, and rendering are local Bun scripts; no network, no vendor.
- **What leaves your machine at L1+:** whatever you put in an AI prompt — your draft verses, corpus excerpts, reference-pack content — goes to the model vendor(s) *you* configured in `models.json`, under *their* data terms. If your project has sensitivity constraints (unpublished Scripture, a security-sensitive region, a partner agreement), review the vendor's data-use policy first, or use the `local` role (offline models) for anything that must not leave the building. The check-set is never sent anywhere by any workflow — it is only read locally by the scoring tools.
- **Cost:** L0 is free forever. For paid tiers, `bun tools/estimate-cost.ts <verse-count>` shows the relative cost *before* you run anything; nothing in this toolkit spends money without you invoking a model yourself. A sane starting budget is the L1.5 loop (`MODES.md`) — roughly two cheap model calls per passage.
- **The AI never writes to your Paratext project.** Export is an explicit, human-triggered step; nothing touches your source of truth on its own.

## What setup does NOT need
- No internet for the deterministic layer (import, lexicon, linter, search, rendering all run locally).
- No specific vendor — bring whatever model you have.
- No code edits — adding a language is configuration.

> The importer is a first-pass scaffold: it gets you a working corpus and profile in minutes, but review the generated profile and fill the reference pack before trusting the AI tiers. The system's honesty comes from the corpus and the linter you give it.
