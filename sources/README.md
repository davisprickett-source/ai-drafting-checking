# Language-Data Sources — ingest anything, trust it appropriately

> Teams arrive with wildly different data: a full NT, one book, a shoebox of field notes, a 19th-century grammar in a dead orthography, a modern dictionary, a linguistics article, texts the team wrote themselves. **All of it is usable. None of it is equal.** This layer lets you register any language data with a quality grade and a usage policy, so the system (and any agent working in this project) knows exactly how far to trust each source.

## The one invariant (never relax it)

**Attestation comes from exactly two places: the Scripture corpus (`paths.corpus`) and human-approved forms (`approve-form.ts`).** Everything registered here is *enrichment* — it can suggest vocabulary, teach constructions, and provide background, but it can never make the linter accept a word, and a form found only in an enrichment source is still written `⟨?⟩` (or `⟨≈⟩`) in a draft until a human confirms it. A dated grammar certifying modern spellings is how orthography rot gets into a translation; the grade system below exists to prevent exactly that.

## Registering a source

```bash
bun tools/register-source.ts --file <path> --type dictionary --title "Marcel Cohen, Le parler arabe des juifs d'Alger" \
  --year 1912 --orthography outdated --grade C --policy grammar-enrichment \
  --notes "French-era transcription; vowel marking differs from current orthography"
```

This records it in `sources/<iso>-sources.json` (the manifest). Drop the actual file (PDF→text, scan→OCR, JSON, markdown — whatever you have) under `sources/<iso>/` so agents can search it.

```bash
bun tools/register-source.ts --list        # see everything registered, with grades
```

## The grades

| Grade | Meaning | Typical examples |
|-------|---------|-----------------|
| **A** | Team-produced or team-verified, current orthography | your own translated books, approved field notes, elicitation answers the team confirmed |
| **B** | Published, current orthography, reliable scholarship | a modern dictionary, a recent reference grammar, vetted text collections |
| **C** | Real scholarship but dated, different orthography, or unverified | a 19th/early-20th-century grammar, a related-dialect dictionary, an old wordlist |
| **D** | Unvetted / unknown provenance | web scrapes, unattributed wordlists, machine-generated text |

## The usage policies (what an agent may do with a source)

| Policy | The agent may… | The agent may NOT… |
|--------|----------------|--------------------|
| `vocabulary-evidence` | propose a word from it, **with the source named and the form marked ⟨?⟩** | treat the form as attested; skip the corpus check |
| `grammar-enrichment` | learn constructions, morphology, discourse patterns from it | copy its *spellings* into a draft (orthography may be dated) |
| `background-only` | use it to understand culture, semantics, history | quote any form from it into a draft at all |

Default pairings (override per source): A → `vocabulary-evidence`, B → `vocabulary-evidence`, C → `grammar-enrichment`, D → `background-only`.

**The C-grade trick (why old sources still pay):** a colonial-era grammar's *transcriptions* are unusable, but its description of, say, verbal aspect or possessive constructions is often the only one that exists. Register it grade C / `grammar-enrichment`: agents mine the *analysis* and re-express any cited form in the current orthography **only after** confirming the modern form via `grep-corpus` / `discover-term` — or flag it for elicitation (`elicitation/ELICITATION.md`) if the corpus is silent.

## For agents: how to use registered sources

1. Read the manifest (`sources/<iso>-sources.json`) at session start if it exists.
2. When the corpus can't answer a vocabulary/grammar question, search the enrichment sources **in grade order** (A → B → C → D), respecting each source's policy.
3. Every claim sourced from enrichment carries its citation: `⟨?⟩ (Cohen 1912 suggests X — verify orthography + currency)`.
4. Gaps that no source fills become elicitation questions, not guesses.

## For agents: finding data the team doesn't have

If the manifest is thin, offer to hunt. A paste-ready research task:

```
Search for published language data on <LANGUAGE> (ISO <iso>): reference grammars,
dictionaries, wordlists, text collections, theses, journal articles (Glottolog,
OLAC, SIL archives, langsci-press, university repositories). For each hit report:
title, author, year, what it contains, orthography era, where to obtain it, and a
suggested grade (A–D) + policy per sources/README.md. Do not fabricate references —
only report items you can point to. Then help me register the ones we obtain.
```

The team decides what to obtain (licensing/copyright is theirs to respect — register metadata freely, but only drop a source's *content* into `sources/` if the team may lawfully hold a copy).
