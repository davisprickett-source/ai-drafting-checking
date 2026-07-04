# The Translation Dossier (the optimal output)

> 🖥️ **The usable output is HTML, not this markdown.** The dossier *data* is a JSON (`multi-model/dossiers/<ref>.json`, schema = the per-verse structure below); `bun tools/build-dossier.ts <dossier.json>` renders it to a self-contained interactive HTML page: drafts **side by side**, every word **checked against the corpus and highlighted inline if unattested** (hover for why), `⟨?⟩` and `{A ⟂ B}` rendered visually, a confidence badge, collapsible source/council, and an editable "your final rendering" box with copy. This markdown file is the data spec + a readable worked example.

> The output is **not** a bare verse-by-verse draft. It is a dossier: per verse, everything a translator needs to make an informed final call — drafts, the council's arguments, the live options, the LWC parallel, the uncertainties, questions, and resource pointers. A bare draft invites rubber-stamping; a dossier makes the translator the decider. This is the engaging, transparent output that answers the anchoring objection (drafts pre-deciding for the translator) while still delivering drafts.

## Per-verse structure

```
## <Book c:v>   [CONFIDENCE: HIGH|MEDIUM|LOW — reasons]

SOURCE
  Hebrew (gloss): <word-gloss + any textual/lexical crux>
  LWC (source parallel): <the LWC parallel — the translator reads the LWC>
  Issue:          <what makes this verse non-trivial, if anything>

DRAFTS (target language)
  ▸ deep:        <draft + one-line argument>
  ▸ workhorse:   <draft + one-line argument>
  ▸ independent: <draft + one-line argument>   (the other-vendor seat — from your CLI/chat)

COUNCIL
  <what each model argued; where they agree; where they split and why>
  Referee: <recommendation ON STATED GROUNDS — not a verdict the human must accept>

OPTIONS (your call)
  A <label>: <rendering>   — warrant: <source feature / interpretive fork>
  B <label>: <rendering>   — warrant: <…>

UNCERTAINTIES / QUESTIONS
  - <what's unresolved; questions that make you engage the decision>

RESOURCES (when relevant)
  - Other translation: <Standard Arabic / etc., when it illuminates>
  - Commentary / translator's note: <pointer>
```

Plain verses (no crux, models agree, verifier clean) collapse to a single line with the recommended rendering and HIGH confidence — the dossier only expands where the work is.

---

# Worked example — schematic (placeholders)

> All bracketed `[…]` values are placeholders — drop in your own verse, language, and source. This shows the SHAPE of a LOW-confidence verse: model disagreement, a textual crux surfaced as options, an idiom philosophy fork, unverified words flagged, and the referee recommending on stated grounds without deciding.

## [Book c:v]   [CONFIDENCE: LOW — models disagree on an aspect/grammar choice; [N] unattested words; 1 textual crux]

SOURCE
  Hebrew (gloss): "[word-by-word gloss] — crux: '[reading A]' or '[reading B]'."
  LWC (source parallel): "[the LWC source line — the translator reads the LWC]"
  Issue:          (1) [the source word] is a textual/lexical crux. (2) "[the idiom]" is a source-language idiom that should not be calqued.

DRAFTS (target language)
  ▸ Opus:    "[draft A — uses **a corpus-supported aspect-marker** and a **receptor-natural idiom** for the key clause; marks an unverified word ⟨?⟩ and a crux {opt1 ⟂ opt2}]"
             — argues: the corpus-supported marker fits the iterative sense; natural idiom over a source calque.
  ▸ Sonnet:  "[draft B — leaks **a related-language auxiliary** the linter flags, and keeps a **source-image calque** for the idiom]"
             — argues: the auxiliary for habitual past; the calque keeps the source image of active causation.
  ▸ Gemini:  (run in your CLI, paste here)

COUNCIL
  - **Aspect/grammar (disagreement → check it):** Draft A used the corpus-supported marker; Draft B used a related-language auxiliary that the profile's `linter_rules` flag (the verifier confirms). Lean away from the flagged auxiliary — but neither marker is clearly right for "[the nuance, e.g. used to give each year]." **Unresolved; needs a native call.**
  - **The textual crux (both flagged it — good):** both surfaced it as options. The LWC source favours [reading A] over [reading B].
  - **The idiom (philosophy split):** Draft A → receptor-natural idiom (attested in the corpus). Draft B → source-image calque, but offered a more natural variant. Both converge that the natural idiom is the target-language path; the LWC source supports it.
  - Referee: recommend the natural idiom and [reading A] on these grounds; flag the aspect/grammar choice as the one genuinely open decision.

OPTIONS (your call)
  A (natural):  "[rendering with the receptor-natural idiom]" — warrant: attested in the corpus; matches the LWC source.
  B (formal):   "[rendering with the source-image calque]" — warrant: preserves the source's active image.
  crux:         {[opt1] ([reading A]) ⟂ [opt2] ([reading B])} — warrant: [reading A] ← LWC + interpretation; [reading B] ← literal source.

UNCERTAINTIES / QUESTIONS
  - "[a key noun]" = [candidate 1] vs [candidate 2]? Neither verified in the target-language register.
  - How does the target language render "[the contested nuance]"? (the aspect/grammar crux)
  - Is [the idiom] used predicatively only, or can it take a causative? [needs native confirmation]

RESOURCES (when relevant)
  - Another translation in a related/major language on [Book c:v] — useful for the crux rendering.
  - Translator's note: [how this verse sets up a later passage] — keep the rendering consistent with that arc.

---

> Note what this single verse surfaced that a one-shot draft would hide: a related-language leak the linter flags, a textual crux, a translation-philosophy fork (natural vs formal on the idiom), and several genuinely unverified words. That is the value of the dossier — and every one of those is a place the translator now thinks instead of rubber-stamps.
