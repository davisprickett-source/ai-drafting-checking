# CONNOT Taxonomy (Barnwell / SIL) — the consultant flagging vocabulary

> The standard category system a translation consultant uses to flag issues during a check (Katharine Barnwell's CONNOT system, SIL 2012). Every note in a consultant check is tagged with one of these. We use it for **two** things: (1) reviewing a *human* translation (the consultant workflow), and (2) the same taxonomy back-feeds the AI-draft flags (the translation-issues reference, `references/<lang>-translation-issues.md`) so one vocabulary serves both. Tag format: category + code, e.g. `Idiom [L]`, `Participant reference [D]`, `Key biblical term [L]: Son of Man`.

## 1. Discourse [D]
Chiasmus · Chronological order of events · Cohesion/transition · Discourse unit · Formula ("Thus says the Lord") · Genre (narrative/procedural/expository/descriptive/hortatory/repartee) · Information load · **Participant reference** (a. introduction of new participant; b. back reference) · Perspective/direction · Poetry · Prominence · Relationship between propositions (reason-result, means-purpose, condition-consequence…) · Speech quotation (direct/indirect) · Theme

## 2. Exegesis and text [E]
Double meaning (author-intended ambiguity) · Interpretation of source text · Old Testament quotation · Textual variant

## 3. Communication [Co]
**Accuracy** · **Ambiguity** (unintended meaning) · Assumed information · **Clarity** · Emotive focus · Illocutionary force (statement/question/command skew) · Implicature · **Naturalness** · Omission of information · Sociolinguistic setting (register)

## 4. Grammar [G]
Comparative relation · Condition (if-clauses) · Ellipsis · Genitive in source text (A-of-B) · Negation · Other clause-level relationships · Passive voice · **Pronominal reference** (extended use, dual-plural, inclusive/exclusive we, gender) · Relative clause · Skewing grammar↔semantics (event nouns→verbs) · **Tense and aspect**

## 5. Culture [Cu]
Anachronism · Cross-cultural mismatch · Symbolism · **Unknown idea** (animal/plant/artifact/custom unknown to readers — solve via specific term, generic term, descriptive phrase, cultural substitute, or loan word)

## 6. Lexicon [L]
Collocation · Connotation · **Idiom** · **Key biblical term** (incl. theological/technical; tag the term, e.g. `Key biblical term [L]: kingdom of God`) · **Lexical correspondence** (incl. consistency — same source word rendered consistently unless reason not to) · **Proper name**

## 7. Rhetoric and highlighting [Rh]
Apostrophe · Euphemism (incl. avoiding "God") · Figurative extension (metonymy, synecdoche) · Form (acrostic, wordplay) · Hendiadys · Hyperbole · Irony · Litotes · **Metaphor** · Parable/allegory · Parallelism (syntactic, lexical) · Personification · Repetition · **Rhetorical question** · Simile · Sound symbolism · Vocative

## 8. Receptor language & setting [RL]
Book introduction · Book title · Cross-reference · Footnote · Front/back matter · Glossary · Influence (theological bias, third-language interference) · Layout · Numbering · **Orthography issues** (spelling, capitalization, punctuation, word breaks) · Parallel passage · Picture selection · Section heading

## 9. Miscellaneous
Catch-all for anything that doesn't fit.

---

## Mapping to our AI-draft flags
Most of what our system already checks IS a CONNOT category — which is why the same taxonomy serves both:
- corpus-membership / orthography linter → **Orthography issues [RL]**, **Naturalness [Co]**, **Lexical correspondence [L]**
- `find-structures` discourse check → **Participant reference [D]**, **Cohesion/transition [D]**, **Chronological order [D]**
- back-translation check → **Accuracy [Co]**, **Omission [Co]**, **Participant reference [D]**
- translation-issues taxonomy → **Idiom [L]**, **Metaphor [Rh]**, **Unknown idea [Cu]**, measurement (Unknown idea), **Rhetorical question [Rh]**, **Key biblical term [L]**
- proper-names → **Proper name [L]**
So a single flag carries a CONNOT tag whether it surfaced from an AI draft or a consultant reading a human translation.

**Honesty note — three grades of "covered."** The mapping above does not mean the system *detects* every category. Be precise about which grade each claim is:
1. **Deterministically detected** (the free tools actually compute it): Orthography issues [RL], unattested vocabulary → part of Naturalness [Co] / Lexical correspondence [L], key-term presence, proper-name forms, the discourse *shapes* a profile's `structure_patterns` encode, **book-wide key-term consistency** (`check-consistency.ts` — the Lexical-correspondence consistency sense, flagging variant renderings and concept-present/anchor-absent verses), and **negation-parity + dropped-clause length heuristics** vs the LWC parallel (`check-completeness.ts` — a cheap slice of Accuracy/Omission [Co]). Regex + corpus membership + parallel alignment — nothing more.
2. **Model-detected** (an AI pass can raise it, with model-grade reliability — real recall gaps, occasional confident misses): Accuracy/Omission via the blinded back-translation diff, Participant reference, Idiom, Metaphor, Unknown idea, Rhetorical question, tense/aspect — the categories the reviewer prompt and deep lenses target.
3. **Vocabulary only** (the taxonomy gives the tag a name, but nothing systematically hunts for it): most of Discourse [D] (chiasmus, prominence, information load, poetry), Rhetoric [Rh] beyond the common figures, Culture [Cu] beyond unknown-idea, sociolinguistic register, illocutionary force, and the whole [RL] apparatus of front/back matter. A consultant working through these still works from their own checklist; the taxonomy just lets their notes and the system's flags share one vocabulary.
A category appearing in this file is a *naming convention*, not a coverage claim.
