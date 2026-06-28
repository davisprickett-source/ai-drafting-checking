# [TARGET LANGUAGE] Orthography Reference

## Overview

Describe your writing system in one paragraph: which script it uses (a Latin romanization, the script of the regional/standard language, a community-developed orthography, etc.), and **why** that choice was made (literacy backgrounds, accessibility, consistency with an existing corpus). State whether this reference describes the same system as your corpus.

If you use a romanization, note the influences/conventions it follows and that the system below is derived from corpus analysis.

> ⚠️ **Corrections from expert / fluent-speaker analysis (apply these):**
> List the specific orthographic fixes a fluent reviewer flagged on real AI drafts. These are the highest-value rules because models break them repeatedly. Examples of the *kind* of rule to record here:
> - **`<a hard cap>`** — e.g. maximum N identical vowels in a row; note that a model violated it.
> - **`<diacritic marking rule>`** — e.g. do/don't mark an initial glottal/pharyngeal; specify word-initial vs. medial behavior. Note that drafts got it wrong.
> - **`<short-vowel choices follow YOUR language, not the standard variety>`** — list the contrasting pairs (`[your form]` not `[standard form]`). Cross-reference `common-errors.template.md` §B.
> - **`<affix / clitic attachment>`** — e.g. pronoun suffixes attach with / without a hyphen; give attested examples. Note the corpus convention.
> - **`<prefer attested high-frequency forms over borrowings>`** — when a word isn't in your corpus, suspect a borrowing from the prestige variety.
>
> These rules belong in the profile's `linter_rules[]` so the check tool enforces them automatically.

---

## Vowels

| Symbol | Description | Examples |
|--------|-------------|----------|
| `[symbol]` | `[short / long, quality]` | `[examples]` |
| `[symbol]` | `[…]` | `[…]` |

> Fill one row per vowel grapheme. If you distinguish length by doubling (or by diacritic), make the long/short pairing explicit.

---

## Consonants

| Symbol | Source-script letter | Sound | Examples |
|--------|----------------------|-------|----------|
| `[symbol]` | `[letter, if mapping from a script]` | `[IPA]` | `[examples]` |
| `[symbol]` | `[…]` | `[…]` | `[…]` |

### Notes
- **`<any grapheme whose value differs from the standard language>`** — e.g. a letter the prestige variety pronounces one way that your language pronounces another; state which spelling you use consistently.
- **`<how the glottal stop / pharyngeals are written>`** — and in which positions.
- **Gemination:** `<how doubled consonants are marked>`.
- **`<article / assimilation behavior>`** — whether sun/moon-type assimilation is marked orthographically.

---

## Definite article / morphophonology

Describe the definite article (or equivalent) and any morphophonological rules around it.

- `<form of the article>` and where it attaches.
- `<assimilation / vowel-elision rules>` — e.g. the article vowel elides after a certain conjunction (`[wa l-]` type). Give examples.
- `<feminine / construct behavior under possession>` — e.g. a feminine `-t` retained before a possessive suffix.

Examples:
- `[example]`
- `[example]`

---

## Key Conventions

- **Proper names:** romanized/spelled per their pronunciation in your language — see `proper-names.template.md` for the authoritative list. `[1-2 examples]`
- **`<your primary clause connector>`** — the main discourse connector. `[example]`
- **`<your contrastive particle>`** — "but / however." `[example]`
- **`<your purpose/result marker>`** — "so that / in order that / because." `[example]`
- **`<a distinctive intensifier>`** — note any particle unique to your language. `[example]`
- **`<your completive marker>`** — "already / done / finished." `[example]`
- **`<your progressive marker>`** — "is [verb]-ing." `[example]`
- **`<your comparison marker>`** — "like / as." `[example]`
- **`<now / currently>`** — `[example]`

---

## Script Note

State the script this corpus uses and the ISO 15924 code if relevant. Note any difference between the script used for AI-drafting experiments and the script a community deployment would require (e.g. drafting in a Latin romanization for consistency with the corpus, but a community release would need a script decision). Make the deployment script decision explicit if it's still open.
