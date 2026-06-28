# [TARGET LANGUAGE] Style Guide

*Vocabulary conventions and translation norms derived from your existing corpus (e.g. a published NT). Use this as the primary reference for any translation work or AI-drafted passages.*

---

## Core Theological Vocabulary

Fill one row per concept with the standing rendering in your language and a usage note. The concepts are language-neutral; the renderings are yours. Keep this list corpus-derived — every form should be attested in your known corpus, not guessed.

| Concept | [Target language] | Notes |
|---------|-------------------|-------|
| God | `[your rendering]` | `<the standing divine name in your tradition — note if it's invariant>` |
| Jesus | `[your rendering]` | `[full form / short form usage]` |
| Christ | `[your rendering]` | — |
| Holy Spirit | `[your rendering]` | `<note if a full form is required, never abbreviated>` |
| Spirit | `[your rendering]` | — |
| Lord | `[your rendering]` | — |
| Father | `[your rendering]` | — |
| Son | `[your rendering]` | — |
| Word | `[your rendering]` | — |
| Kingdom | `[your rendering]` | — |
| Life / Eternal life | `[your rendering]` | — |
| Sin | `[your rendering]` | `[sg / pl]` |
| Grace / Mercy | `[your rendering]` | — |
| Truth | `[your rendering]` | — |
| Salvation / Save | `[your rendering]` | — |
| Faith / Believe | `[your rendering]` | — |
| Prayer | `[your rendering]` | — |
| Prophet | `[your rendering]` | — |
| Person / Man | `[your rendering]` | `<note if it differs from the standard-variety word>` |
| Heart | `[your rendering]` | `<watch sg/pl — a leak point>` |

> Extend this table to cover every recurring theological term in your corpus. Where a concept's rendering is still open, mark it `(check usage)` rather than guessing.

---

## Discourse Particles and Connectors

| Particle | Usage | Examples |
|----------|-------|----------|
| `[and / clause connector]` | `[your primary connector]` | `[example]` |
| `[but / however]` | contrastive | `[example]` |
| `[so that / because]` | purpose / result | `[example]` |
| `[if / when]` | conditional / temporal | `[example]` |
| `[when]` | temporal | `[example]` |
| `[no / negation]` | standalone | `[example]` |
| `[pre-verbal negator]` | negation | `[example]` |
| `[already / done]` | completive | `[example]` |
| `[truly / very]` | intensifier | `[example]` |
| `[like / as]` | comparison | `[example]` |
| `[now]` | temporal | `[example]` |

---

## Verbal System Reference

### Aspect Markers

| Construction | Meaning | Example |
|--------------|---------|---------|
| `[progressive construction]` | progressive (is doing) | `[example]` |
| `[stative construction]` | stative present | `[example]` |
| `[perfect stem]` | completed action | `[example]` |
| `[completive construction]` | completed / already | `[example]` |

### Person/Number Prefixes (Imperfect)

| Prefix | Person | Example |
|--------|--------|---------|
| `[prefix]` | 3ms (he) | `[example]` |
| `[prefix]` | 2ms / 3fs | `[example]` |
| `[prefix]` | 1pl (we) | `[example]` |
| `[pattern]` | 2pl | `[example]` |
| `[pattern]` | 3pl | `[example]` |
| `[prefix]` | 1s (I) | `[example]` |

### Common Verbs

| Verb | Meaning | 3ms imperfect |
|------|---------|---------------|
| `[stem]` | do / make | `[imperfect]` |
| `[stem]` | say / tell | `[imperfect]` |
| `[stem]` | come | `[imperfect]` |
| `[stem]` | go | `[imperfect]` |
| `[stem]` | give | `[imperfect]` |
| `[stem]` | send | `[imperfect]` |

> Extend with the high-frequency verbs your drafting actually needs.

---

## Register and Style Notes

### General Register
Describe the target register in a sentence or two: e.g. natural spoken style vs. formal/literary, typical sentence length, vocabulary accessibility, oral-first or not. State what stiffness to avoid (e.g. translated-from-the-standard-variety feel).

### Key Style Markers
1. **`<your primary discourse connector>`** — note if nearly every sentence opens with it, and that this is authentic, not to be edited out.
2. **Direct speech punctuation** — `<your convention, e.g. guillemets «…»>`.
3. **`<any fixed formula>`** — e.g. the standing rendering of "Truly I tell you"; use consistently.
4. **`<your "person/man" word>`** — use it instead of the standard-variety form.
5. **`<full-form requirements>`** — e.g. always use the full form of "Holy Spirit," never abbreviate.
6. **`<your purpose marker>`** for purpose clauses.

### OT Proper Name Conventions

> ⚠️ **Authoritative names live in `proper-names.template.md`.** Do not build an analogy-based name table here — analogy-guessing is exactly what produces flagged errors. For any real draft, use the proper-names template, and respect its **CHECK-SET FIREWALL**: never feed names from a published reference of the text you're drafting into the drafting session; reconcile only at the check stage.

State the one-line rule: derive OT name forms from the authoritative + corpus tables in `proper-names.template.md`, mark all others `[UNVERIFIED]`.

**Warning:** OT characters must NOT receive names belonging to NT characters (a known NMT failure mode). This requires careful prompting when using AI for OT drafting.

---

## Measurement and Cultural Adaptation

Record the cultural adaptations your tradition makes, with the principle behind each. Keep generic illustrative examples in brackets:

- **`[snow → a locally-known white substance]`** — when a source image is unknown locally, substitute a locally-known equivalent that carries the same connotation (whiteness/cleanliness).
- **`[an unfamiliar object → a familiar local counterpart]`** — e.g. a foreign structural/tool term rendered with a locally-known object that plays the same role.
- **`[foreign measures → local measures]`** — check whether your corpus already converts units, and follow it.

For OT drafting, similar adaptations will be needed. Instruct the AI to *attempt* cultural adaptation and *flag* it; the human reviewer assesses whether each adaptation is accurate and natural.
