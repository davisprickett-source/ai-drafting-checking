# Draft Annotation: Uncertainty, Options, Confidence, Transparency

> The goal of this layer is not a prettier draft. It is a draft that **cannot be passively accepted** — one that discloses its own uncertainty, shows its options with reasons, and asks the translator to think. Transparency *is* the critical-thinking aid: a confident-looking clean draft invites automation bias; a draft that says "I'm unsure here, and here's why, and here are two defensible options" forces engagement. This is how we answer the anchoring / skill-decline objection raised against AI drafting while still producing drafts.

## 1. In-line markup (what the model writes in the draft)

| Marker | Meaning | Example |
|--------|---------|---------|
| `word⟨?⟩` | low-confidence word — unsure it's genuine target language, or unsure of choice | `[word]⟨?⟩` |
| `{A ⟂ B}` | genuine alternatives, both defensible | `{[option A] ⟂ [option B]}` |
| `⟦…⟧` | inline crux note (why this is hard) | `⟦Heb. ambiguous: "spirit" or "wind"⟧` |
| `NAME⟨?⟩` | proposed proper name not yet confirmed | `[Name]⟨?⟩` |

**Honesty rule (carry over from the protocol):** if the model is not confident a word is real in the target language, it marks it `⟨?⟩` rather than emitting a confident guess. A flagged gap beats a fluent hallucination every time.

## 2. Options must carry a WARRANT

Never present bare alternatives — a coin-flip menu just gives the translator three anchors instead of one. Every option is tied to the *reason it exists*, so the translator chooses on grounds, not vibes:

```
<Book c:v>  "the LORD had closed her womb"
  Option A (formal):     [literal rendering]       ⟦literal "closed her womb"⟧
  Option B (idiomatic):  [natural rendering]       ⟦natural target-language "made her barren" — attested in the corpus⟧
  Warrant for the choice: A keeps the Hebrew metaphor; B matches attested target-language usage. Pick B unless the metaphor carries weight you want to preserve.
```

The warrant names the **source feature or interpretive fork** driving each option: a textual variant, an ambiguous referent, an idiom, a formal-vs-idiomatic tradeoff, or a reader-assistance choice.

## 3. Per-verse confidence — signals, NOT a vibe

A model's self-rated "confidence: 8/10" is noise; models are overconfident and uncalibrated. Real confidence is an **ensemble of objective signals** (computed by `tools/score-draft.ts`):

| Signal | Source | What it means |
|--------|--------|---------------|
| **Lexical attestation** | lexicon (`paths.lexicon`) membership | % of content words attested in the real corpus. Low = invented/risky. Objective. |
| **Cross-model agreement** | `compare-drafts.ts` | Do independent models render this verse the same? Disagreement = uncertain. Objective. |
| **Back-translation fidelity** | model back-translates → diff vs source / the LWC parallel | Meaning preserved? Mismatch = uncertain. Semi-objective. |
| **Source difficulty** | flagged crux (variant/idiom/rare word) | Some verses are inherently uncertain regardless of the draft. Prior. |
| Model self-report | the model | Allowed, but explicitly the **least** reliable — down-weighted, never the headline number. |

`score-draft.ts` rolls the objective signals into a tier per verse:
- **HIGH** — attestation ≥ 97%, no `⟨?⟩` markers, models agree (or single draft).
- **MEDIUM** — minor gaps.
- **LOW** — attestation < 85%, or `⟨?⟩` markers present, or models disagree. These verses get human attention first.

The tier is shown *with its reasons*, e.g. `[LOW: attestation 78%, 2 unattested words, models disagree]` — transparency, not a bare number.

## 4. Critical-thinking questions (per hard verse)

For any LOW/MEDIUM verse, the model appends 1–2 questions that pull the translator into the decision instead of letting them rubber-stamp:

```
<Book c:v>  "no razor shall touch his head"
  Q: Will a reader in your language know this signals a vow of dedication to God? Should we make it explicit?
  Q: A character speaks of herself in the 3rd person ("your servant"). Keep it, or shift to 1st ("me, your servant")?
```

These are generated, in the target language, as part of the apparatus — the kind of help that has often never existed in an under-resourced language.

## 5. The annotated-draft format (`drafts/<book>-<ch>-<model>.json`)

```json
{
  "passage": "<Book chapter>", "model": "…", "date": "…",
  "verses": {
    "<Book>:1:5": {
      "draft": "[target-language draft with [word]⟨?⟩ markers] …",
      "confidence": { "tier": "MEDIUM", "attestation": 0.91, "agreement": null, "reasons": ["1 unattested word"] },
      "options": [
        { "label": "formal", "text": "[literal rendering]", "warrant": "keeps Hebrew metaphor" },
        { "label": "idiomatic", "text": "[natural rendering]", "warrant": "attested in the corpus" }
      ],
      "notes": "Heb. idiom 'closed her womb'.",
      "questions": ["Does the idiomatic option read naturally for permanent vs temporary barrenness?"]
    }
  }
}
```

`tools/score-draft.ts` fills/verifies the `confidence` block from objective signals; the model writes `draft`, `options`, `notes`, `questions`. Plain-text drafts (just the `draft` string per verse) are still accepted everywhere — the annotation is additive.
