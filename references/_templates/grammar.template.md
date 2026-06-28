# [TARGET LANGUAGE] Grammar Reference

*Derived from corpus analysis. For translation work and AI model context.*

---

## Overview

One paragraph on the typological profile of your language: family/contact background, base word order, how verbs inflect (prefix/suffix, tense vs. aspect), and the main ways it differs from the regional/standard language a model is likely to confuse it with. Naming those differences up front primes the rest of the file.

---

## Word Order

- **Default:** `<your default order — SVO / VSO / SOV>` `[example]`
- **Narrative:** `<typical narrative order, e.g. verb-initial>` `[example]`
- **Fronted topic:** `<topic-comment structure if present>` `[example]`

---

## The Verb System

### Tense/Aspect

State whether your language is tense-prominent or aspect-prominent, then fill the table.

| Form | Meaning | Example |
|------|---------|---------|
| **Perfect / completed** | `[completed action]` | `[example]` |
| **Imperfect / ongoing** | `[ongoing or future]` | `[example]` |
| **Progressive** | `[your progressive construction]` | `[example]` |
| **Completive** | `[your completive construction]` | `[example]` |
| **Stative** | `[stative construction]` | `[example]` |

### Imperfect Conjugation Pattern

```
1s:   [prefix]   →  [example]
2ms:  [prefix]   →  [example]
2fs:  [pattern]  →  [example]
3ms:  [prefix]   →  [example]
3fs:  [prefix]   →  [example]
1pl:  [prefix]   →  [example]
2pl:  [pattern]  →  [example]
3pl:  [pattern]  →  [example]
```

### Perfect Conjugation

```
3ms:  [pattern]  → [example]
3fs:  [pattern]  → [example]
1s:   [pattern]  → [example]
2ms:  [pattern]  → [example]
3pl:  [pattern]  → [example]
```

### Negation

- **`[your pre-verbal negator]`** before the verb: `[example]`
- **`[emphatic negation pattern]`** for emphasis: `[example]`
- **`[standalone "no"]`**: `[example]`

---

## Noun System

### Definite Article
`<your article and how it attaches>`. Note any spoken assimilation and whether it's marked in writing.

### Number
- Singular: `[examples]`
- Plural: `<how plurals form — suffix, broken/internal, collective>` `[examples]`

### Gender
- `<default gender, how the marked gender is signaled>` `[examples]`

### Construct / Possession
`<how possession is expressed — particle, juxtaposition, suffix>`:
- `[example]` = `[gloss]`
- `[example]` = `[gloss]` `<note any special construct morphology>`

### Pronouns (Possessive Suffixes)
- `[suffix]` = my: `[example]`
- `[suffix]` = your (sg): `[example]`
- `[suffix]` = your (pl): `[example]`
- `[suffix]` = his: `[example]`
- `[suffix]` = her: `[example]`
- `[suffix]` = our: `[example]`
- `[suffix]` = their: `[example]`

### Subject Pronouns (and dialect-leak corrections)
List your independent subject pronouns, and **flag every one that differs from the prestige/standard variety** — these are prime leak points:
- `[he]` | **`[she]`** (NOT `[the standard-variety form]`) | `[I]` | `[you]`
- **`[they]`** (NOT `[the standard form]`)
- `<any object/possessive suffix that a model imports wrongly>` (use **`[your form]`**, NOT `[their form]`)

### Critical correction: `<your progressive>` vs. `<the imported auxiliary>`
If your language marks ongoing/background action differently from the prestige variety, spell it out here — this is often the **#1 leak tell**. State which construction is correct, which imported auxiliary models overuse, and that the verifier should count its density.

### `<other high-value morphophonology corrections>`
e.g. article elision after a conjunction (`[wa l-]` not `[wa al-]`); feminine `-t` retained before a possessive suffix (`[form]` not `[form]`). Add the corrections your reviewer flagged. These belong in `linter_rules[]`.

---

## Prepositions and Particles

| Particle | Meaning | Notes |
|----------|---------|-------|
| `[particle]` | `[in / at]` | `[usage]` |
| `[particle]` | `[from / of]` | `[usage]` |
| `[particle]` | `[to / for]` | `[usage]` |
| `[particle]` | `[with / by]` | `[usage]` |
| `[particle]` | `[on / upon]` | `[usage]` |

---

## Subordinate Clauses

### Purpose / Result: `[your marker]`
"So that / in order that / because" — `[example sentence with gloss]`. Note what it combines with (e.g. + imperfect verb).

### Conditional: `[your marker]`
"If / when" — `[example with gloss]`

### Relative Clause: `[your strategy]`
`<how relative clauses are formed — relative pronoun, article-as-relativizer, gap>`:
- `[example]` = `[gloss]`
- `[example]` = `[gloss]`

### Temporal: `[your marker]`
"When" — `[example with gloss]`

---

## Discourse Features

### Topic-Comment
`<fronted topic then comment, if used>`: `[example]` = `[gloss]`

### Fixed formulas
Record any **fixed rendering** your tradition uses for a recurring source phrase (e.g. "Truly I say to you," "Thus says the LORD"). Give the exact target-language formula and instruct that it be used consistently: `[formula]` = `[gloss]`.

### Direct Speech
`<how quoted speech is introduced and punctuated>` — e.g. an introducer verb + quotation marks/guillemets. `[example]`

### Narrative Sequence
`<how chained events are strung together>` — e.g. a sequential connector at the head of each clause. `[example]`

---

## Key Lexical Features

### `[your word for "person / man"]`
Note any high-frequency core word that differs from the standard variety and is central to the translation. State what NOT to replace it with.

### `[your progressive marker]`
Clarify its exact function (e.g. genuinely ongoing action, not a static "to be"). `[example]`

### `[a distinctive intensifier / particle]`
Note any particle that's distinctively your language and more expressive than a plain "very." `[example]`

### `[your purpose marker]`
High-frequency purpose/reason connector — note its frequency and that it should be used wherever the source has "so that." `[example]`

### `[your completive marker]`
Indicates completion/already-done state; warn against confusing it with a future or temporal sense. `[example]`
